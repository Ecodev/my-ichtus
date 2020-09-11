import {Component, Injector} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookingsComponent} from './bookings.component';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';

@Component({
    selector: 'app-bookings-with-owner',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsWithOwnerComponent extends BookingsComponent {
    constructor(
        bookingWithOwnerService: BookingWithOwnerService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        permissionsService: PermissionsService,
    ) {
        super(bookingWithOwnerService, injector, naturalSearchFacetsService, permissionsService);
    }
}
