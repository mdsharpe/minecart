import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable, interval, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { StatsModel } from '../../models';
import { WorldService } from '../../services/world.service';

@Component({
    selector: 'app-game',
    templateUrl: './game-shell.component.html',
    styleUrls: ['./game-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameShellComponent implements OnInit, OnDestroy {
    constructor(
        private readonly _worldService: WorldService
    ) {
        this.stats = combineLatest(
            this._worldService.world$,
            this._worldService.records$,
            interval(500)
        ).pipe(
            takeUntil(this.unsubscribe$),
            map((o) => {
                return new StatsModel(o[0], o[1]);
            })
        );
    }

    private readonly unsubscribe$ = new Subject<void>();

    public stats: Observable<StatsModel>;

    public ngOnInit(): void {
        this._worldService.init();
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public resetButtonClick():void {
        this._worldService.init({
            recreateGround: false
        })
    }
}
