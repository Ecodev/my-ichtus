import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {BookingService} from '../../admin/bookings/services/booking.service';
import {BookableQuery, BookingsQuery, BookingType} from '../../shared/generated-types';
import {PermissionsService} from '../../shared/services/permissions.service';
import {TimeagoModule} from 'ngx-timeago';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {NaturalFileComponent} from '@ecodev/natural';
import {UserContactDataComponent} from '../../shared/components/user-contact-data/user-contact-data.component';

@Component({
    selector: 'app-bookable',
    imports: [
        NaturalFileComponent,
        MatDivider,
        MatIcon,
        MatButton,
        RouterLink,
        TimeagoModule,
        UserContactDataComponent,
    ],
    templateUrl: './bookable.component.html',
    styleUrl: './bookable.component.scss',
})
export class BookableComponent implements OnInit {
    private readonly bookableService = inject(BookableService);
    private readonly route = inject(ActivatedRoute);
    private readonly permissionsService = inject(PermissionsService);
    protected readonly bookingService = inject(BookingService);

    /**
     * If the user has a required licence to use the bookable
     */
    protected hasLicense = false;

    /**
     * If the booking is free / available for a new navigation
     */
    protected isAvailable = false;

    /**
     * If the user has taken the welcome session
     */
    protected welcomeSessionTaken = false;

    /**
     * If is applicable for a navigation booking purpose
     * Basically : true only for self-approved bookables.
     */
    protected isNavigable = false;
    protected canAccessAdmin = false;
    protected runningBooking: BookingsQuery['bookings']['items'][0] | null = null;

    protected bookable: BookableQuery['bookable'] | null = null;

    public ngOnInit(): void {
        this.route.data.subscribe(data => {
            this.bookable = data.model;
            this.initForBookable();
        });
    }

    private initForBookable(): void {
        if (!this.bookable) {
            return;
        }

        const viewer = this.route.snapshot.data.viewer;
        this.canAccessAdmin = this.permissionsService.canAccessAdmin(viewer);
        this.welcomeSessionTaken = viewer.welcomeSessionDate !== null;
        this.hasLicense = BookableService.isLicenseGranted(this.bookable, viewer);
        this.isNavigable = this.bookable.bookingType === BookingType.SelfApproved;
        this.bookableService.getAvailability(this.bookable).subscribe(availability => {
            this.isAvailable = availability.isAvailable;
            this.runningBooking = availability.result.items[0];
        });
    }

    protected endBooking(): void {
        if (this.runningBooking) {
            this.bookingService.terminateBooking(this.runningBooking.id).subscribe(() => {
                this.initForBookable();
            });
        }
    }

    protected back(): void {
        window.history.back();
    }
}
