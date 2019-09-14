import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Engine, Bodies, World, Body, Composite, Vector, Constraint, Events } from 'matter-js';
import { WorldView } from '../models/world-view';

@Injectable({
    providedIn: 'root'
})
export class WorldService {
    private _coinCreateTimeoutId: number | null = null;
    private _engine: Engine | null = null;
    private _cart: Composite | null = null;
    private _coins: Body[] = [];
    private _torque: number = 0;

    public readonly world$ = new BehaviorSubject<WorldView | null>(null);

    public init(): void {
        this._engine = Engine.create();

        const ground = this.createGround(-100, 0, 50000);
        this._cart = this.createCart(0, -100, 75, 45, 10, 10, 15);

        World.add(this._engine.world, ground);
        World.add(this._engine.world, this._cart);

        Events.on(this._engine, 'afterUpdate', (e: Body) => {
            if (this._cart) {
                this._cart.bodies[1].torque = this._torque;
                this._cart.bodies[2].torque = this._torque;
            }
        })

        Engine.run(this._engine);

        this.addCoins(0, -150, 15, 1000, 100)
            .then(() => {
                this._torque = 0.025;
            });

        this.world$.next(new WorldView({
            engine: this._engine,
            cart: this._cart.bodies[0],
            coins: this._coins
        }));
    }

    private createGround(x: number, y: number, width: number): Composite {
        const segments: Body[] = [];

        const thickness = 20;
        const baseWidth = 200;
        const vWidth = 100;
        let vY = 0;

        do {
            const width = baseWidth + ((Math.random() * vWidth) - (vWidth / 2))
            const deltaY = (Math.random() * vY) - (vY / 2);

            const segmentVertices: Vector[] = [
                { x: 0, y: 0 },
                { x: width, y: deltaY },
                { x: width, y: deltaY + thickness },
                { x: 0, y: thickness }
            ];

            const segment = Bodies.fromVertices(x + (width / 2), y + (deltaY / 2), [segmentVertices], {
                isStatic: true,
                frictionStatic: 1
            });

            segments.push(segment);
            x += width;
            y += deltaY;
            vY += 5;
        } while (x <= width);

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
}
