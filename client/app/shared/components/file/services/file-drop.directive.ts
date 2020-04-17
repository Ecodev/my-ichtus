import { Directive, ElementRef, HostListener } from '@angular/core';
import { ngfDrop } from 'angular-file';
import { UploadService } from './upload.service';

@Directive({
    selector: '[appFileDrop]',
})
export class FileDropDirective extends ngfDrop {

    private isOverlayVisible = false;
    private overlayVisibleClass = 'show-action';

    constructor(element: ElementRef, private uploadService: UploadService) {
        super(element);

        // Never fix orientation because it's buggy and CPU intensive
        this.ngfFixOrientation = false;

        this.filesChange.subscribe((data: File[]) => {
            this.removeOverlay();
            uploadService.filesChanged.next(data);
        });
    }

    /**
     * Prevent drag and drop if disabled or if nobody is waiting for files
     */
    @HostListener('dragover', ['$event']) onDragOver(event: Event): void {

        if (this.fileDropDisabled || this.uploadService.filesChanged.observers.length === 0) {
            return;
        }

        if (!this.isOverlayVisible) {
            this.isOverlayVisible = true;
            this.element.nativeElement.classList.add(this.overlayVisibleClass);
        }

        super.onDragOver(event);
    }

    onDragLeave(event) {
        this.removeOverlay();
        super.onDragLeave(event);
    }

    private removeOverlay() {
        this.element.nativeElement.classList.remove(this.overlayVisibleClass);
        this.isOverlayVisible = false;
    }

    /**
     * The original eventToTransfer can return null, but eventToFiles try to access an attribute on that potential null causing error.
     * This overrides eventToFiles to prevent this error, but TODO should report bug on original repo and remove this fn when fixed.
     */
    public eventToFiles(event: Event): any[] {
        const transfer = this.eventToTransfer(event);
        if (transfer) {
            if (transfer.files && transfer.files.length) {
                return transfer.files;
            }
            if (transfer.items && transfer.items.length) {
                return transfer.items;
            }
        }
        return [];
    }
}
