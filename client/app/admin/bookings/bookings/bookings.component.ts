import {Component} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {AbstractBookings} from './abstract-bookings';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent extends AbstractBookings<BookingService> {
    public constructor(
        bookingService: BookingService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookingService);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.advancedFacets ? 'bookingsAdvanced' : 'bookings',
        );
    }
}
