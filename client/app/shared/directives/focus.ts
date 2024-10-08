import {AfterViewInit, Directive, ElementRef, inject} from '@angular/core';

@Directive({
    selector: '[appFocus]',
    standalone: true,
})
export class FocusDirective implements AfterViewInit {
    public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    public ngAfterViewInit(): void {
        setTimeout(() => this.elementRef.nativeElement.focus());
    }
}
