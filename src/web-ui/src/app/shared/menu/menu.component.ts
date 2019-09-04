import { Component, OnInit, HostBinding, HostListener, ElementRef } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    private readonly _element: ElementRef;

    constructor(element: ElementRef) {
        this._element = element;
    }

    @HostBinding('class.menu-open')
    private _open = false;

    @HostListener('document:click', ['$event'])
    private onClick(event: MouseEvent): void {
        if (!this._element.nativeElement.contains(event.target) && this._open) {
            this._open = false;
        }
    }

    public ngOnInit() {
    }

    public toggleMenu() {
        this._open = !this._open;
    }
}
