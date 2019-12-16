import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { Bookable, BookingStatus } from '../../../shared/generated-types';
import { UserService } from '../../../admin/users/services/user.service';
import { NaturalAlertService } from '@ecodev/natural';

@Component({
    selector: 'app-self-approved-booking',
    templateUrl: './self-approved-booking.component.html',
    styleUrls: ['./self-approved-booking.component.scss'],
})
export class SelfApprovedBookingComponent implements OnInit {

    public bookable: Bookable['bookable'];
    public booking;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private userService: UserService,
                private bookingService: BookingService,
                private bookableService: BookableService,
                private alertService: NaturalAlertService) {
    }

    public ngOnInit(): void {

        this.booking = this.bookingService.getConsolidatedForClient();
        this.booking.status = BookingStatus.booked;
        this.booking.owner = this.route.snapshot.data.viewer.model;

        const bookable = this.route.snapshot.params.bookable;
        if (bookable) {

            // TODO: replace by watchOne (exist in okpilot) because attributes of object may have changed since last visit
            this.bookableService.getOne(bookable).subscribe(newBookable => {
                this.bookable = newBookable;
            });
        }

    }

    public createBooking() {
        this.bookingService.createWithBookable(this.bookable, this.booking.owner, this.booking).subscribe(() => {
            this.alertService.info('Votre sortie a été enregistrée. Soyez prudent.', 5000);
            this.router.navigate(['/']);
        });
    }

}
