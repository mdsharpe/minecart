import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Engine, Render, Bodies, World, Body, Composites, Composite, Vector, Vertices } from 'matter-js';

@Component({
    selector: 'app-game',
    templateUrl: './game-shell.component.html',
    styleUrls: ['./game-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})
export class GameShellComponent implements OnInit, OnDestroy {
    constructor(
    ) {
    }

    private readonly unsubscribe$ = new Subject<void>();

    @ViewChild("worldContainer", { static: true })
    private _worldContainer: ElementRef | null = null;

    public ngOnInit(): void {
        if (this._worldContainer) {
            // create an engine
            var engine = Engine.create();

            // create a renderer
            var render = Render.create({
                element: this._worldContainer.nativeElement,
                engine: engine
            });

            // create two boxes and a ground
            var cart = this.createCart(100, 100);
            console.log(cart);
            var boxA = Bodies.rectangle(400, 200, 80, 80);
            var boxB = Bodies.rectangle(450, 50, 80, 80);
            var ground = Bodies.rectangle(400, 550, 700, 60, { isStatic: true });
            Body.rotate(ground, 0.2);

            // add all of the bodies to the world
            World.add(engine.world, [ground, boxA, boxB]);
            World.add(engine.world, [cart]);

            // run the engine
            Engine.run(engine);

            // run the renderer
            Render.run(render);
        }
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private createCart(x: number, y: number): Composite {
        const bodyVertices : Vector[] = [
            { x: 0, y: 0},
            { x: 5, y: 0}
        ];
        const body = Bodies.fromVertices(x, y, [bodyVertices])

        return Composite.create({
            bodies: []
        });
    }
}
