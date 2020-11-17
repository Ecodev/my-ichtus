import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {BookingService} from '../../admin/bookings/services/booking.service';
import {UserService} from '../../admin/users/services/user.service';
import {NaturalAbstractController} from '@ecodev/natural';
import {Bookings, BookingType} from '../../shared/generated-types';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
})
export class BookableComponent extends NaturalAbstractController implements OnInit {
    /**
     * If the user has a required licence to use the bookable
     */
    public hasLicense: boolean;

    /**
     * If the booking is free / available for a new navigation
     */
    public isAvailable: boolean;

    /**
     * If is applicable for a navigation booking purpose
     * Basically : true only for self-approved bookables.
     */
    public isNavigable: boolean;
    public canAccessAdmin: boolean;
    public runningBooking: Bookings['bookings']['items'][0] | null;

    public bookable;

    constructor(
        private bookableService: BookableService,
        private route: ActivatedRoute,
        public bookingService: BookingService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.route.data.subscribe(data => {
            this.bookable = data.bookable.model;
            if (this.bookable) {
                this.initForBookable();
            }
        });
    }

    private initForBookable(): void {
        const viewer = this.route.snapshot.data.viewer.model;
        this.canAccessAdmin = UserService.canAccessAdmin(viewer);
        this.hasLicense = BookableService.isLicenseGranted(this.bookable, viewer);
        this.isNavigable = this.bookable.bookingType === BookingType.self_approved;
        this.bookableService.getAvailability(this.bookable).subscribe(availability => {
            this.isAvailable = availability.isAvailable;
            this.runningBooking = availability.result.items[0];
        });
    }

    public endBooking(): void {
        if (this.runningBooking) {
            this.bookingService.terminateBooking(this.runningBooking.id).subscribe(() => {
                this.initForBookable();
            });
        }
    }
}
