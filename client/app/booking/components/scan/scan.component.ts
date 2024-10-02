import {Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NaturalAlertService} from '@ecodev/natural';
import {QrService} from '../../../shared/services/qr.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.component.html',
    styleUrl: './scan.component.scss',
    standalone: true,
})
export class ScanComponent implements OnInit, OnDestroy {
    public readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly alertService = inject(NaturalAlertService);
    private readonly qrService = inject(QrService);

    private readonly destroyRef = inject(DestroyRef);
    @ViewChild('video', {static: true}) private videoRef!: ElementRef<HTMLVideoElement>;

    public ngOnInit(): void {
        this.qrService.qrCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(stream => {
                this.videoRef.nativeElement.srcObject = stream;
                this.videoRef.nativeElement.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
                this.videoRef.nativeElement.play().catch(/* noop */);
            });

        // In case we arrive here by url refresh that avoids to start camera from click on home.component.ts
        // Won't cause double scanning
        this.qrService.start();
    }

    public ngOnDestroy(): void {
        this.qrService.stop();
    }
}
