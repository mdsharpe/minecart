import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Engine, Render, Bodies, World, Body, Composites, Composite, Vector, Vertices, Constraint, Events, Bounds } from 'matter-js';

@Component({
    selector: 'app-game',
    templateUrl: './game-shell.component.html',
    styleUrls: ['./game-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})
export class GameShellComponent implements OnInit, OnDestroy {
    constructor() { }

    private readonly unsubscribe$ = new Subject<void>();

    private _engine: Engine | null = null;
    private _render: Render | null = null;
    private _cart: Composite | null = null;

    @ViewChild("worldContainer", { static: true })
    private _worldContainer: ElementRef | null = null;

    public ngOnInit(): void {
        this.initWorld();
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    @HostListener('window:resize', ['$event'])
    private onResize(evt: Event): void {
        this.fitToScreen();
    }

    private fitToScreen(): void {
        if (this._render) {
            this._render.canvas.width = window.innerWidth;
            this._render.canvas.height = window.innerHeight;
        }
    }

    private initWorld(): void {
        this._engine = Engine.create();

        var renderOptions = {
            showAngleIndicator: true,
            showVelocity: true,
            showCollisions: true,
            hasBounds: true,
            width: 1200,
            height: 700
        };

        this._render = Render.create({
            element: this._worldContainer!.nativeElement,
            engine: this._engine,
            options: renderOptions
        });

        this._cart = this.createCart(150, 30, 40, 30, 10, 3, 10);
        const ground = this.createGround(300, 10000);

        World.add(this._engine.world, [ground, this._cart]);

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
                this._cart.bodies[1].torque = 0.003;
                this._cart.bodies[2].torque = 0.003;
            }
        })

        this.fitToScreen();

        Engine.run(this._engine);
        Render.run(this._render);
    }

    private createGround(y: number, width: number): Composite {
        const segments: Body[] = [];

        const thickness = 20;
        const baseWidth = 200;
        const vWidth = 100;
        let vY = 50;

        let x = 0;

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
        const wheel = Bodies.circle(x, y + (radius * 1.5), radius);

        const bodyCenter = body.position;

        const constraint = Constraint.create({
            bodyA: body,
            pointA: { x: x - bodyCenter.x, y: (y - bodyCenter.y) + radius * 1.5 },
            bodyB: wheel
        });

        return { wheel, constraint };
    }
}
