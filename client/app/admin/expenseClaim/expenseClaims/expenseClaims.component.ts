import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {ExpenseClaims, ExpenseClaimsVariables} from '../../../shared/generated-types';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-expense-claims',
    templateUrl: './expenseClaims.component.html',
    styleUrls: ['./expenseClaims.component.scss'],
})
export class ExpenseClaimsComponent
    extends NaturalAbstractList<ExpenseClaims['expenseClaims'], ExpenseClaimsVariables>
    implements OnInit {
    constructor(
        expenseClaimService: ExpenseClaimService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(expenseClaimService, injector);

        this.naturalSearchFacets = naturalSearchFacetsService.get('expenseClaims');
    }
}
