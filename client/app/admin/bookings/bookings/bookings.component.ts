import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractList } from '@ecodev/natural';
import { Bookings, BookingsVariables } from '../../../shared/generated-types';
import { BookingService } from '../services/booking.service';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalPersistenceService } from '@ecodev/natural';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
import { PermissionsService } from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent extends NaturalAbstractList<Bookings['bookings'], BookingsVariables> implements OnInit {

    constructor(route: ActivatedRoute,
                router: Router,
                public bookingService: BookingService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
    ) {

        super(bookingService,
            router,
            route,
            alertService,
            persistenceService,

        );
    }
}
