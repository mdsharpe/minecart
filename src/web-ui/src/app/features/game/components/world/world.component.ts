import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Render, Events, Bounds } from 'matter-js';

import { WorldService } from '../../services/world.service';

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
    private _render: Render | null = null;

    @ViewChild("worldContainer", { static: true })
    private _worldContainer: ElementRef<HTMLElement> | null = null;

    public ngOnInit(): void {
        this._worldService.world$
            .pipe(
                takeUntil(this._unsubscribe$)
            )
            .subscribe((o) => {
                if (!o) {
                    return;
                }

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
                    engine: o.engine,
                    options: <any>renderOptions
                });

                Events.on(o.engine, 'beforeTick', () => {
                    if (this._render && o && o.cart) {
                        Bounds.shift(
                            this._render.bounds,
                            {
                                x: o.cart.position.x - window.innerWidth / 4,
                                y: o.cart.position.y - window.innerHeight / 2
                            });
                    }
                });

                Render.run(this._render);
            });
    }

    public ngOnDestroy(): void {
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
}
