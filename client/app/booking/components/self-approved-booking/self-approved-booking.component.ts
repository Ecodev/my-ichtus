import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {Bookable, BookingStatus} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {Literal, NaturalAlertService, NaturalAvatarComponent, NaturalFixedButtonComponent} from '@ecodev/natural';
import {TextFieldModule} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';

import {CardComponent} from '../../../shared/components/card/card.component';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-self-approved-booking',
    templateUrl: './self-approved-booking.component.html',
    styleUrls: ['./self-approved-booking.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        CardComponent,
        NaturalAvatarComponent,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        TextFieldModule,
        NaturalFixedButtonComponent,
    ],
})
export class SelfApprovedBookingComponent implements OnInit {
    public bookable: Bookable['bookable'] | null = null;
    public booking: Literal = {};

    public constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly bookingService: BookingService,
        private readonly bookableService: BookableService,
        private readonly alertService: NaturalAlertService,
    ) {}

    public ngOnInit(): void {
        this.booking = this.bookingService.getDefaultForServer();
        this.booking.status = BookingStatus.booked;
        this.booking.owner = this.route.snapshot.data.viewer.model;

        if (this.route.snapshot.data.bookable?.model) {
            this.bookable = this.route.snapshot.data.bookable.model as Bookable['bookable'];
            this.bookableService.getAvailability(this.bookable).subscribe(availability => {
                if (!availability.isAvailable) {
                    this.router.navigate(['/booking/', this.bookable!.code]);
                }
            });
        }
    }

    public createBooking(): void {
        this.bookingService.createWithBookable(this.bookable, this.booking.owner, this.booking).subscribe(() => {
            this.alertService.info('Votre sortie a été enregistrée. Soyez prudent.', 5000);
            this.router.navigate(['/']);
        });
    }
}
