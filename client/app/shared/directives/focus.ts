import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
    selector: '[appFocus]',
    standalone: true,
})
export class FocusDirective implements AfterViewInit {
    public constructor(public readonly elementRef: ElementRef<HTMLElement>) {}

    public ngAfterViewInit(): void {
        setTimeout(() => this.elementRef.nativeElement.focus());
    }
}
