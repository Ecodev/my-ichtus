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
import {CommonModule, DatePipe} from '@angular/common';
import {expenseClaims} from '../../../shared/natural-search/natural-search-facets';
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
        NaturalEnumPipe,
        DatePipe,
    ],
})
export class ExpenseClaimsComponent extends NaturalAbstractList<ExpenseClaimService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);

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

    public constructor() {
        super(inject(ExpenseClaimService));

        this.naturalSearchFacets = expenseClaims();
    }
}
