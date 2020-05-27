import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {Bookings, BookingsVariables} from '../../../shared/generated-types';
import {BookingService} from '../services/booking.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent extends NaturalAbstractList<Bookings['bookings'], BookingsVariables> implements OnInit {
    constructor(
        public bookingService: BookingService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(bookingService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
