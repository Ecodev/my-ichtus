import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
import { UserTags, UserTagsVariables } from '../../../shared/generated-types';
import { UserTagService } from '../services/userTag.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { NaturalPersistenceService } from '@ecodev/natural';
import { NaturalAbstractList } from '@ecodev/natural';

@Component({
    selector: 'app-user-tags',
    templateUrl: './userTags.component.html',
    styleUrls: ['./userTags.component.scss'],
})
export class UserTagsComponent extends NaturalAbstractList<UserTags['userTags'], UserTagsVariables> implements OnInit {

    constructor(route: ActivatedRoute,
                router: Router,
                userTagService: UserTagService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
    ) {

        super(userTagService,
            router,
            route,
            alertService,
            persistenceService,

        );

    }
}
