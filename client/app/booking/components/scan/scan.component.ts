import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NaturalAbstractController, NaturalAlertService} from '@ecodev/natural';
import {QrService} from '../../../shared/services/qr.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.component.html',
    styleUrl: './scan.component.scss',
    standalone: true,
})
export class ScanComponent extends NaturalAbstractController implements OnInit, OnDestroy {
    @ViewChild('video', {static: true}) private videoRef!: ElementRef<HTMLVideoElement>;

    public constructor(
        public readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        private readonly qrService: QrService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.qrService.qrCode.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: code => {
                const parsedCode = code.toLowerCase().replace('https://ichtus.club/booking/', '');
                this.router.navigate(['..', parsedCode], {relativeTo: this.route});
            },
            error: () => {
                const message = 'La caméra est indisponible, essaye de taper le code de ton matériel';
                this.alertService.error(message, 5000);
                this.router.navigateByUrl('/booking/by-code');
            },
        });

        this.qrService
            .getStream()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(stream => {
                this.videoRef.nativeElement.srcObject = stream;
                this.videoRef.nativeElement.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
                this.videoRef.nativeElement.play().catch(/* noop */);
            });

        // In case we arrive here by url refresh that avoids to start camera from click on home.component.ts
        // Won't cause double scanning
        this.qrService.start();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.qrService.stop();
    }
}
