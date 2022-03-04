import {Component, Injector, Input} from '@angular/core';
import {SafetyBookingService} from './safety-booking.service';
import {NaturalSearchFacetsService} from '../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../shared/services/permissions.service';
import {AbstractBookings} from '../admin/bookings/bookings/abstract-bookings';

@Component({
    selector: 'app-safety',
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
})
export class SafetyComponent extends AbstractBookings<SafetyBookingService> {
    public constructor(
        safetyBookingService: SafetyBookingService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(safetyBookingService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
