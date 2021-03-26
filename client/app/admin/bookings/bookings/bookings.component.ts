import {Component, Injector} from '@angular/core';
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
    constructor(
        bookingService: BookingService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(bookingService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
