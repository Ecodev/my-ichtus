import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalPersistenceService } from '@ecodev/natural';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
import { TransactionTags, TransactionTagsVariables } from '../../../shared/generated-types';
import { TransactionTagService } from '../services/transactionTag.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { NaturalAbstractList } from '@ecodev/natural';

@Component({
    selector: 'app-transaction-tags',
    templateUrl: './transactionTags.component.html',
    styleUrls: ['./transactionTags.component.scss'],
})
export class TransactionTagsComponent
    extends NaturalAbstractList<TransactionTags['transactionTags'], TransactionTagsVariables>
    implements OnInit {

    constructor(route: ActivatedRoute,
                router: Router,
                transactionTagService: TransactionTagService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
    ) {

        super(transactionTagService,
            router,
            route,
            alertService,
            persistenceService,

        );

    }
}
