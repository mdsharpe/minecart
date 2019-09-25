import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Render, Events, Bounds } from 'matter-js';

import { WorldService } from '../../services/world.service';
import { WorldView } from '../../models';

@Component({
    selector: 'app-world',
    templateUrl: './world.component.html',
    styleUrls: ['./world.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit, OnDestroy {
    constructor(
        private readonly _worldService: WorldService
    ) { }

    private readonly _unsubscribe$ = new Subject<void>();
    private _world: WorldView | null = null;
    private _render: Render | null = null;
    private _onBeforeTick: (() => void) | null = null;

    @ViewChild("worldContainer", { static: true })
    private _worldContainer: ElementRef<HTMLElement> | null = null;

    public ngOnInit(): void {
        this._worldService.world$
            .pipe(
                takeUntil(this._unsubscribe$)
            )
            .subscribe((world) => {
                this.tearDownRender();

                if (world) {
                    this._world = world;
                    this.setUpRender(world);
                }
            });
    }

    public ngOnDestroy(): void {
        this.tearDownRender();
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
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

    private setUpRender(world: WorldView): void {
        const container = this._worldContainer!.nativeElement;

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
            engine: world.engine,
            options: <any>renderOptions
        });

        this._onBeforeTick = () => {
            this.recenter();
        };

        Events.on(world.engine, 'beforeTick', this._onBeforeTick);

        Render.run(this._render);
    }

    private tearDownRender(): void {
        if (this._world && this._onBeforeTick) {
            Events.off(this._world.engine, 'beforeTick', this._onBeforeTick);
            this._onBeforeTick = null;
        }
        
        if (this._render) {
            Render.stop(this._render);
            this._render.canvas.remove();
            this._render.textures = {};
        }
    }

    private recenter(): void {
        if (this._render && this._world && this._world.cart) {
            Bounds.shift(this._render.bounds, {
                x: this._world.cart.position.x - window.innerWidth / 4,
                y: this._world.cart.position.y - window.innerHeight / 2
            });
        }
    }
}
