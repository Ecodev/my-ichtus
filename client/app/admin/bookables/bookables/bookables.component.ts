import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalPersistenceService } from '@ecodev/natural';
import { NaturalSearchFacetsService } from '../../../shared/natural-search/natural-search-facets.service';
import { NaturalAbstractList } from '@ecodev/natural';
import { Bookables, BookablesVariables } from '../../../shared/generated-types';
import { BookableService } from '../services/bookable.service';
import { PermissionsService } from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class BookablesComponent extends NaturalAbstractList<Bookables['bookables'], BookablesVariables> implements OnInit {

    @Output() select = new EventEmitter();

    constructor(route: ActivatedRoute,
                router: Router,
                bookableService: BookableService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                public permissionsService: PermissionsService,
                injector: Injector
    ) {

        super(bookableService,
            router,
            route,
            alertService,
            persistenceService,
            injector
        );
        this.naturalSearchFacets = naturalSearchFacetsService.get(this.route.snapshot.data.isStorage ? 'storage' : 'bookables');
    }
}
