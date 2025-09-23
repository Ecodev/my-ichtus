import {Component, inject, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalEnumPipe,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {expenseClaims} from '../../../shared/natural-search/natural-search-facets';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';

@Component({
    selector: 'app-expense-claims',
    imports: [
        AsyncPipe,
        DatePipe,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatSort,
        MatSortHeader,
        NaturalTableButtonComponent,
        MatTooltip,
        NaturalAvatarComponent,
        MatButton,
        MoneyComponent,
        MatIcon,
        NaturalIconDirective,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalEnumPipe,
    ],
    templateUrl: './expenseClaims.component.html',
    styleUrl: './expenseClaims.component.scss',
})
export class ExpenseClaimsComponent extends NaturalAbstractList<ExpenseClaimService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);

    public override availableColumns: AvailableColumn[] = [
        {id: 'name', label: 'Nom'},
        {id: 'owner', label: 'Membre'},
        {id: 'updateDate', label: 'Dernière modification'},
        {id: 'status', label: 'État'},
        {id: 'type', label: 'Type'},
        {id: 'remarks', label: 'Remarques'},
        {id: 'amount', label: 'Montant'},
        {id: 'sector', label: 'Secteur concerné', checked: false},
        {id: 'reviewer', label: 'Approbateur', checked: false},
    ];

    public constructor() {
        super(inject(ExpenseClaimService));

        this.naturalSearchFacets = expenseClaims();
    }
}
