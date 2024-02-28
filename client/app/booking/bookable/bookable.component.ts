import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {BookingService} from '../../admin/bookings/services/booking.service';
import {Bookable, Bookings, BookingType} from '../../shared/generated-types';
import {PermissionsService} from '../../shared/services/permissions.service';
import {TimeagoModule} from 'ngx-timeago';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {NaturalFileComponent} from '@ecodev/natural';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrls: ['./bookable.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        NaturalFileComponent,
        MatDividerModule,
        MatIconModule,
        MatButtonModule,
        RouterLink,
        TimeagoModule,
    ],
})
export class BookableComponent implements OnInit {
    /**
     * If the user has a required licence to use the bookable
     */
    public hasLicense = false;

    /**
     * If the booking is free / available for a new navigation
     */
    public isAvailable = false;

    /**
     * If the user has taken the welcome session
     */
    public welcomeSessionTaken = false;

    /**
     * If is applicable for a navigation booking purpose
     * Basically : true only for self-approved bookables.
     */
    public isNavigable = false;
    public canAccessAdmin = false;
    public runningBooking: Bookings['bookings']['items'][0] | null = null;

    public bookable: Bookable['bookable'] | null = null;

    public constructor(
        private readonly bookableService: BookableService,
        private readonly route: ActivatedRoute,
        private readonly permissionsService: PermissionsService,
        public readonly bookingService: BookingService,
    ) {}

    public ngOnInit(): void {
        this.route.data.subscribe(data => {
            this.bookable = data.bookable.model;
            this.initForBookable();
        });
    }

    private initForBookable(): void {
        if (!this.bookable) {
            return;
        }

        const viewer = this.route.snapshot.data.viewer.model;
        this.canAccessAdmin = this.permissionsService.canAccessAdmin(viewer);
        this.welcomeSessionTaken = viewer.welcomeSessionDate !== null;
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

    public back(): void {
        window.history.back();
    }
}
