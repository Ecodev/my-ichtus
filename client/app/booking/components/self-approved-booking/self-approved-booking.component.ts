import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {BookableQuery, BookingStatus} from '../../../shared/generated-types';
import {Literal, NaturalAlertService, NaturalAvatarComponent, NaturalFixedButtonComponent} from '@ecodev/natural';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {CardComponent} from '../../../shared/components/card/card.component';
import {Observable, of, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-self-approved-booking',
    imports: [
        CardComponent,
        NaturalAvatarComponent,
        MatDivider,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        CdkTextareaAutosize,
        NaturalFixedButtonComponent,
    ],
    templateUrl: './self-approved-booking.component.html',
    styleUrl: './self-approved-booking.component.scss',
})
export class SelfApprovedBookingComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly bookingService = inject(BookingService);
    private readonly bookableService = inject(BookableService);
    private readonly alertService = inject(NaturalAlertService);

    protected bookable: BookableQuery['bookable'] | null = null;
    protected booking: Literal = {};

    public constructor() {
        this.route.data
            .pipe(
                takeUntilDestroyed(),
                switchMap(data => (data.bookable as Observable<BookableQuery['bookable'] | null>) ?? of(null)),
                first(),
            )
            .subscribe(bookable => {
                if (bookable) {
                    this.bookable = bookable;
                    this.bookableService.getAvailability(this.bookable).subscribe(availability => {
                        if (!availability.isAvailable) {
                            this.router.navigate(['/booking/', this.bookable!.code]);
                        }
                    });
                }
            });
    }

    public ngOnInit(): void {
        this.booking = this.bookingService.getDefaultForServer();
        this.booking.status = BookingStatus.Booked;
        this.booking.owner = this.route.snapshot.data.viewer;
    }

    protected createBooking(): void {
        this.bookingService.createWithBookable(this.bookable, this.booking.owner, this.booking).subscribe(() => {
            this.alertService.info('Votre sortie a été enregistrée. Soyez prudent.', 5000);
            this.router.navigate(['/']);
        });
    }
}
