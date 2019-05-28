import { Component } from '@angular/core';
import { BookingsComponent } from '../admin/bookings/bookings/bookings.component';
import { SafetyBookingService } from './safety-booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalSearchFacetsService } from '../shared/natural-search/natural-search-facets.service';
import { PermissionsService } from '../shared/services/permissions.service';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalPersistenceService } from '@ecodev/natural';

@Component({
    selector: 'app-safety',
    templateUrl: '../admin/bookings/bookings/bookings.component.html',
})
export class SafetyComponent extends BookingsComponent {

    constructor(route: ActivatedRoute,
                router: Router,
                bookingService: SafetyBookingService, // Reason of the override
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                permissionsService: PermissionsService) {

        super(route, router, bookingService, alertService, persistenceService, naturalSearchFacetsService, permissionsService);
    }

}
