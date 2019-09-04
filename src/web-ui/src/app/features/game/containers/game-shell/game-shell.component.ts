import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Engine, Render, Bodies, World } from 'matter-js';

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
            var boxA = Bodies.rectangle(400, 200, 80, 80);
            var boxB = Bodies.rectangle(450, 50, 80, 80);
            var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

            // add all of the bodies to the world
            World.add(engine.world, [boxA, boxB, ground]);

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
}
