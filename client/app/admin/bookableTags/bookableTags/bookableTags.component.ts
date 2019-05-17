import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalPersistenceService } from '@ecodev/natural';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
import { NaturalAbstractList } from '@ecodev/natural';
import { BookableTags, BookableTagsVariables } from '../../../shared/generated-types';
import { BookableTagService } from '../services/bookableTag.service';
import { PermissionsService } from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookable-tags',
    templateUrl: './bookableTags.component.html',
    styleUrls: ['./bookableTags.component.scss'],
})
export class BookableTagsComponent extends NaturalAbstractList<BookableTags['bookableTags'], BookableTagsVariables> implements OnInit {

    constructor(route: ActivatedRoute,
                router: Router,
                bookableTagService: BookableTagService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
    ) {

        super(bookableTagService,
            router,
            route,
            alertService,
            persistenceService,

        );

    }
}
