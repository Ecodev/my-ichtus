import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractNavigableList, NaturalAlertService, NaturalPersistenceService } from '@ecodev/natural';
import { Accounts, AccountsVariables } from '../../../shared/generated-types';
import { NaturalSearchFacetsService } from '../../../shared/natural-search/natural-search-facets.service';
import { AccountService } from '../services/account.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { TransactionLineService } from '../../transactions/services/transactionLine.service';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends NaturalAbstractNavigableList<Accounts['accounts'], AccountsVariables> {

    constructor(route: ActivatedRoute,
                router: Router,
                accountService: AccountService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                public permissionsService: PermissionsService,
                public transactionLineService: TransactionLineService,
    ) {

        super(accountService,
            router,
            route,
            alertService,
            persistenceService,

        );
        this.naturalSearchFacets = naturalSearchFacetsService.get('accounts');
    }

    public addLink(): any[] {
        let route: any[] = ['/admin/account/new'];
        const parentId = this.route.snapshot.params['parent'];
        if (parentId) {
            route = route.concat([{parent: parentId}]);
        }
        return route;
    }

}
