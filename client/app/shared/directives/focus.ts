import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
    selector: '[appFocus]',
})
export class FocusDirective implements AfterViewInit {
    public constructor(public readonly elementRef: ElementRef) {}

    public ngAfterViewInit(): void {
        setTimeout(() => this.elementRef.nativeElement.focus());
    }
}
