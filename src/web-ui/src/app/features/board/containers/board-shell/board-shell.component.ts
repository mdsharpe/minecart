import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'app-board',
    templateUrl: './board-shell.component.html',
    styleUrls: ['./board-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})
export class BoardShellComponent implements OnInit, OnDestroy {
    constructor(
    ) {
    }

    private readonly unsubscribe$ = new Subject<void>();

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
