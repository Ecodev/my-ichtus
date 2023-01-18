import {Component, Injector} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {AbstractBookings} from './abstract-bookings';
import {ContactType} from '../../../shared/components/copy-contact-data/copy-contact-data.component';

@Component({
    selector: 'app-bookings-with-owner',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsWithOwnerComponent extends AbstractBookings<BookingWithOwnerService> {
    public override contactType: ContactType = 'bookingsWithOwnerContact';

    public constructor(
        bookingWithOwnerService: BookingWithOwnerService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookingWithOwnerService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookingsForBookable');
    }
}
