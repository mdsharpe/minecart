import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';

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

    public ngOnInit(): void {
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
