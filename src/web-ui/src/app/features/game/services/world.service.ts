import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Engine, Bodies, World, Body, Composite, Vector, Constraint, Events } from 'matter-js';

import { WorldView } from '../models/world-view';
import { RecordsModel, RecordsModelOptions } from '../models';

export interface WorldInitOptions {
    recreateGround?: boolean;
}

const CoinMaxCount = 15;

interface GroundSegment {
    x: number;
    y: number;
    vertices: Vector[];
}

@Injectable({
    providedIn: 'root'
})
export class WorldService {
    private readonly _groundPlot: GroundSegment[] = [];
    private readonly _coins: Body[] = [];
    private _ground: Composite | null = null;
    private _coinCreateTimeoutId: number | null = null;
    private _engine: Engine | null = null;
    private _cart: Composite | null = null;
    private _torque: number = 0;

    public readonly world$ = new BehaviorSubject<WorldView | null>(null);
    public readonly records$ = new BehaviorSubject<RecordsModel | null>(null);

    public init(options?: WorldInitOptions): void {
        options = options || {};

        if (this._engine) {
            this.records$.next(this.getRecords());

            World.clear(this._engine.world, false);
            Engine.clear(this._engine);
        }

        this._coinCreateTimeoutId = null;
        this._torque = 0;

        this._engine = Engine.create();

        if (options.recreateGround || !this._groundPlot.length) {
            this.plotGround(-100, 0, 50000);
        }

        this._ground = this.createGround();

        World.add(this._engine.world, this._ground);

        this._cart = this.createCart(0, -100, 75, 45, 10, 10, 15);
        World.add(this._engine.world, this._cart);

        Events.on(this._engine, 'afterUpdate', (e: Body) => {
            if (this._cart) {
                this._cart.bodies[1].torque = this._torque;
                this._cart.bodies[2].torque = this._torque;
            }
        })

        Engine.run(this._engine);

        this._coins.length = 0;
        this.addCoins(0, -150, CoinMaxCount, 1000, 100)
            .then(() => {
                this._torque = 0.025;
            });

        this.world$.next(new WorldView({
            engine: this._engine,
            cart: this.getCart()!,
            coins: this._coins,
            coinMaxCount: CoinMaxCount
        }));
    }

    private plotGround(x: number, y: number, width: number): void {
        this._groundPlot.length = 0;

        const thickness = 20;
        const baseWidth = 200;
        const vWidth = 100;
        let vY = 0;

        do {
            const width = baseWidth + ((Math.random() * vWidth) - (vWidth / 2))
            const deltaY = (Math.random() * vY) - (vY / 2);

            this._groundPlot.push({
                x: x + (width / 2),
                y: y + (deltaY / 2),
                vertices: [
                    { x: 0, y: 0 },
                    { x: width, y: deltaY },
                    { x: width, y: deltaY + thickness },
                    { x: 0, y: thickness }
                ]
            })

            x += width;
            y += deltaY;
            vY += 5;
        } while (x <= width);
    }

    private createGround(): Composite {
        const segments: Body[] = [];

        for (const gps of this._groundPlot) {
            const segment = Bodies.fromVertices(
                gps.x,
                gps.y,
                [gps.vertices],
                {
                    isStatic: true,
                    frictionStatic: 1
                });

            segments.push(segment);
        }

        return Composite.create({
            bodies: segments
        });
    }

    private createCart(
        x: number,
        y: number,
        baseWidth: number,
        height: number,
        sideOffset: number,
        thickness: number,
        wheelRadius: number
    ): Composite {
        const bodyVertices: Vector[] = [
            { x: 0, y: 0 },
            { x: thickness, y: 0 },
            { x: thickness + sideOffset, y: height },
            { x: thickness + sideOffset + baseWidth, y: height },
            { x: thickness + sideOffset + baseWidth + sideOffset, y: 0 },
            { x: thickness + sideOffset + baseWidth + sideOffset + thickness, y: 0 },
            { x: thickness + sideOffset + baseWidth + thickness, y: height + thickness },
            { x: sideOffset, y: height + thickness },
        ];
        const body = Bodies.fromVertices(x, y, [bodyVertices]);

        const wheel1 = this.createCartWheel(body.vertices[1].x, body.vertices[1].y, wheelRadius, body);
        const wheel2 = this.createCartWheel(body.vertices[2].x, body.vertices[2].y, wheelRadius, body);

        return Composite.create({
            bodies: [body, wheel1.wheel, wheel2.wheel],
            constraints: [wheel1.constraint, wheel2.constraint]
        });
    }

    private createCartWheel(x: number, y: number, radius: number, body: Body): { wheel: Body, constraint: Constraint } {
        const wheel = Bodies.circle(x, y + (radius * 1.5), radius, {
            friction: 1
        });

        const bodyCenter = body.position;

        const constraint = Constraint.create({
            bodyA: body,
            pointA: { x: x - bodyCenter.x, y: (y - bodyCenter.y) + radius * 1.5 },
            bodyB: wheel
        });

        return { wheel, constraint };
    }

    private addCoins(x: number, y: number, quantity: number, delay: number, interval: number): Promise<void> {
        return new Promise<void>((resolve) => {
            let clearCoinTimeout = () => {
                if (this._coinCreateTimeoutId) {
                    window.clearTimeout(this._coinCreateTimeoutId);
                }

                this._coinCreateTimeoutId = null;
            };

            let createCoin: () => void;

            const scheduleCoinCreation = (timeout: number) => {
                clearCoinTimeout();

                this._coinCreateTimeoutId = window.setTimeout(() => {
                    createCoin();
                }, timeout)
            };

            createCoin = () => {
                clearCoinTimeout();

                if (!this._engine) {
                    return;
                }

                const coin = Bodies.circle(x, y, 5, {
                    slop: 0
                });
                World.add(this._engine.world, coin);
                this._coins.push(coin);

                if (this._coins.length < quantity) {
                    scheduleCoinCreation(interval);
                } else {
                    resolve();
                }
            };

            clearCoinTimeout();
            scheduleCoinCreation(delay);
        });
    }

    private getCart(): Body | null {
        return this._cart ? this._cart.bodies[0] : null;
    }

    private getRecords(): RecordsModel {
        const cart = this.getCart();
        const currentDist = cart ? cart.position.x : 0;

        const prevRecords = this.records$.value;
        const prevRecordDist = prevRecords ? prevRecords.distanceMax : 0;

        return new RecordsModel({
            distanceMax : Math.max(currentDist, prevRecordDist)
        });
    }
}
