import {Component, Injector} from '@angular/core';
import {BookingsComponent} from '../admin/bookings/bookings/bookings.component';
import {SafetyBookingService} from './safety-booking.service';
import {NaturalSearchFacetsService} from '../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../shared/services/permissions.service';
import {NaturalPersistenceService} from '@ecodev/natural';

@Component({
    selector: 'app-safety',
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
})
export class SafetyComponent extends BookingsComponent {
    constructor(
        bookingService: SafetyBookingService, // Reason of the override
        injector: Injector,
        persistenceService: NaturalPersistenceService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        permissionsService: PermissionsService,
    ) {
        super(bookingService, injector, naturalSearchFacetsService, permissionsService);
    }
}
