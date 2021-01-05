import {Component, Injector} from '@angular/core';
import {SafetyBookingService} from './safety-booking.service';
import {NaturalSearchFacetsService} from '../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../shared/services/permissions.service';
import {NaturalAbstractList} from '@ecodev/natural';

@Component({
    selector: 'app-safety',
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
})
export class SafetyComponent extends NaturalAbstractList<SafetyBookingService> {
    constructor(
        safetyBookingService: SafetyBookingService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(safetyBookingService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('bookings');
    }
}
