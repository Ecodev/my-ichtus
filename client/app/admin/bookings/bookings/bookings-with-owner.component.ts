import {Component, Injector} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {AbstractBookings} from './abstract-bookings';
import {bookingsWithOwnerContactQuery} from '../services/booking.queries';
import {BookingsWithOwnerContactQuery_bookings_items} from '../../../shared/generated-types';

@Component({
    selector: 'app-bookings-with-owner',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsWithOwnerComponent extends AbstractBookings<BookingWithOwnerService> {
    public queryForContacts = bookingsWithOwnerContactQuery;

    constructor(
        bookingWithOwnerService: BookingWithOwnerService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookingWithOwnerService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }

    public mapResultFunction = (resultData: any) =>
        resultData['bookings'].items.map((i: BookingsWithOwnerContactQuery_bookings_items) => i.owner);
}
