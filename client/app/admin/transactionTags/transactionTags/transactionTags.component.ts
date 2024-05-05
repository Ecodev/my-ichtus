import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalAvatarComponent,
    NaturalTableButtonComponent,
    NaturalFixedButtonComponent,
} from '@ecodev/natural';
import {TransactionTagService} from '../services/transactionTag.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

@Component({
    selector: 'app-transaction-tags',
    templateUrl: './transactionTags.component.html',
    styleUrl: './transactionTags.component.scss',
    standalone: true,
    imports: [
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalAvatarComponent,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
    ],
})
export class TransactionTagsComponent extends NaturalAbstractList<TransactionTagService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'color', label: 'Couleur'},
        {id: 'name', label: 'Nom'},
        {id: 'transactions', label: 'Transactions'},
    ];
    public constructor(
        transactionTagService: TransactionTagService,
        public readonly permissionsService: PermissionsService,
        public readonly transactionLineService: TransactionLineService,
    ) {
        super(transactionTagService);
    }
}
