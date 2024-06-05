import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    NaturalAvatarComponent,
    NaturalIconDirective,
    NaturalFixedButtonComponent,
    NaturalCapitalizePipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-expense-claims',
    templateUrl: './expenseClaims.component.html',
    styleUrl: './expenseClaims.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        NaturalAvatarComponent,
        MatButtonModule,
        MoneyComponent,
        MatIconModule,
        NaturalIconDirective,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalCapitalizePipe,
        NaturalEnumPipe,
        NaturalSwissDatePipe,
    ],
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
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(expenseClaimService);

        this.naturalSearchFacets = naturalSearchFacetsService.get('expenseClaims');
    }
}
