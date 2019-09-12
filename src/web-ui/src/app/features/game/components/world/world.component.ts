import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Engine, Render, Bodies, World, Body, Composite, Vector, Constraint, Events, Bounds } from 'matter-js';

@Component({
    selector: 'app-world',
    templateUrl: './world.component.html',
    styleUrls: ['./world.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit, OnDestroy {
    constructor() { }

    private _engine: Engine | null = null;
    private _render: Render | null = null;
    private _cart: Composite | null = null;
    private _torque: number = 0;

    private _coinCreateTimeoutId: number | null = null;

    @ViewChild("worldContainer", { static: true })
    private _worldContainer: ElementRef<HTMLElement> | null = null;

    public ngOnInit(): void {
        this.initWorld();
    }

    public ngOnDestroy(): void {
    }

    @HostListener('window:resize', ['$event'])
    public onResize(evt: Event): void {
        this.fitToScreen();
    }

    private fitToScreen(): void {
        if (this._render) {
            const container = this._worldContainer!.nativeElement;

            this._render.canvas.width = container.clientWidth;
            this._render.canvas.height = container.clientHeight;
        }
    }

    private initWorld(): void {
        const container = this._worldContainer!.nativeElement;

        this._engine = Engine.create();

        var renderOptions = {
            showAngleIndicator: true,
            showVelocity: true,
            showCollisions: true,
            hasBounds: true,
            width: container.clientWidth,
            height: container.clientHeight
        };

        this._render = Render.create({
            element: container,
            engine: this._engine,
            options: <any>renderOptions
        });

        const ground = this.createGround(0, 0, 50000);
        this._cart = this.createCart(100, -100, 75, 45, 10, 10, 15);

        World.add(this._engine.world, ground);
        World.add(this._engine.world, this._cart);

        Events.on(this._engine, 'beforeTick', () => {
            if (this._render && this._cart) {
                Bounds.shift(
                    this._render.bounds,
                    {
                        x: this._cart.bodies[0].position.x - window.innerWidth / 4,
                        y: this._cart.bodies[0].position.y - window.innerHeight / 2
                    });
            }
        });

        Events.on(this._engine, 'afterUpdate', (e: Body) => {
            if (this._cart) {
                this._cart.bodies[1].torque = this._torque;
                this._cart.bodies[2].torque = this._torque;
            }
        })

        Engine.run(this._engine);
        Render.run(this._render);

        this.addCoins(100, -150, 15, 1000, 100)
            .then(() => {
                this._torque = 0.025;
            })
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
            let count = 0;

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
                count++;

                if (count < quantity) {
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