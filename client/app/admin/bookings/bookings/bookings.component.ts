import {Component, Inject, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {
    Bookings,
    BookingsVariables,
    BookingsWithOwnerBalance,
    BookingsWithOwnerBalanceVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../services/booking.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent
    extends NaturalAbstractList<
        Bookings['bookings'] | BookingsWithOwnerBalance['bookings'],
        BookingsVariables | BookingsWithOwnerBalanceVariables
    >
    implements OnInit {
    constructor(
        @Inject(BookingService) public bookingService: BookingService | BookingWithOwnerService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(bookingService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
