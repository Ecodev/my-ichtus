import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
    selector: '[appFocus]',
})
export class FocusDirective implements AfterViewInit {
    constructor(public elementRef: ElementRef) {}

    public ngAfterViewInit() {
        setTimeout(() => this.elementRef.nativeElement.focus());
    }
}
