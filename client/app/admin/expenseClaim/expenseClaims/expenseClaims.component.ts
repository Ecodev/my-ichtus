import {Component, Injector, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-expense-claims',
    templateUrl: './expenseClaims.component.html',
    styleUrls: ['./expenseClaims.component.scss'],
})
export class ExpenseClaimsComponent extends NaturalAbstractList<ExpenseClaimService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'name', label: 'Nom'},
        {id: 'owner', label: 'Membre'},
        {id: 'updateDate', label: 'Dernière modification'},
        {id: 'status', label: 'Status'},
        {id: 'type', label: 'Type'},
        {id: 'remarks', label: 'Remarques'},
        {id: 'amount', label: 'Montant'},
        {id: 'sector', label: 'Secteur concerné', checked: false},
        {id: 'reviewer', label: 'Approbateur', checked: false},
    ];

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
