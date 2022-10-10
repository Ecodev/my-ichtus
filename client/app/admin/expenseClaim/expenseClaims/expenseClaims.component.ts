import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-expense-claims',
    templateUrl: './expenseClaims.component.html',
    styleUrls: ['./expenseClaims.component.scss'],
})
export class ExpenseClaimsComponent extends NaturalAbstractList<ExpenseClaimService> implements OnInit {
    public selectedColumns = ['name', 'owner', 'updateDate', 'status', 'type', 'remarks', 'amount'];

    public constructor(
        expenseClaimService: ExpenseClaimService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(expenseClaimService, injector);

        this.naturalSearchFacets = naturalSearchFacetsService.get('expenseClaims');
    }
}
