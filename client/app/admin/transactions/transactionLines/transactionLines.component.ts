import {Component, inject, Input, input, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFixedButtonComponent,
    NaturalQueryVariablesManager,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    TypedMatCellDef,
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {transactionLines} from '../../../shared/natural-search/natural-search-facets';
import {TransactionLineService} from '../services/transactionLine.service';
import {
    ExportTransactionLinesVariables,
    MinimalAccount,
    type TransactionLineMeta,
} from '../../../shared/generated-types';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {union} from 'es-toolkit';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {RouterLink} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatFooterRow,
    MatFooterRowDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';

@Component({
    selector: 'app-transaction-lines',
    imports: [
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatFooterRowDef,
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        MatHeaderRow,
        MatRow,
        MatFooterRow,
        MatSort,
        MatSortHeader,
        NaturalTableButtonComponent,
        MatTooltip,
        MoneyComponent,
        TransactionAmountComponent,
        MatCheckbox,
        NaturalAvatarComponent,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        RouterLink,
        DatePipe,
        AsyncPipe,
    ],
    templateUrl: './transactionLines.component.html',
    styleUrl: './transactionLines.component.scss',
})
export class TransactionLinesComponent extends NaturalAbstractList<TransactionLineService> implements OnInit {
    protected readonly permissionsService = inject(PermissionsService);

    public override availableColumns: AvailableColumn[] = [
        {id: 'transactionDate', label: 'Date'},
        {id: 'name', label: 'Nom'},
        {id: 'bookable', label: 'Réservable'},
        {id: 'remarks', label: 'Remarques'},
        {id: 'balance', label: 'Montant'},
        {id: 'account', label: 'Compte'},
        {id: 'isReconciled', label: 'Pointé'},
        {id: 'documents', label: 'Justificatifs'},
        {id: 'tag', label: 'Tag'},
    ];

    protected readonly buttons: Button[] = [
        {
            label: `Télécharger la liste au format Excel`,
            icon: 'file_download',
            click: (): void => this.download(),
        },
    ];

    @Input() public relativeToAccount: MinimalAccount | null = null;
    public readonly hideFab = input(false);

    public constructor() {
        super(inject(TransactionLineService));

        this.naturalSearchFacets = transactionLines();
    }

    protected download(): void {
        const qvm = new NaturalQueryVariablesManager<ExportTransactionLinesVariables>(this.variablesManager);

        this.service.getExportLink(qvm).subscribe(url => {
            window.location.href = url;
        });
    }

    protected filterByAccount(account: MinimalAccount): void {
        if (this.hideFab()) {
            const link = this.service.linkToTransactionLinesForAccount(account);
            this.router.navigate(link);
        } else {
            const selection = TransactionLineService.getSelectionForAccount(account);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    protected documentCount(tl: TransactionLineMeta): number {
        const transaction = tl.transaction;
        const expenseClaim = transaction.expenseClaim;

        return union(
            transaction.accountingDocuments.map(document => (document ? document.id : null)),
            expenseClaim ? expenseClaim.accountingDocuments.map(document => (document ? document.id : null)) : [],
        ).length;
    }

    protected filterByTag(tag: NonNullable<TransactionLineMeta['transactionTag']>): void {
        if (this.hideFab()) {
            const link = this.service.linkToTransactionLinesForTag(tag);
            this.router.navigate(link);
        } else {
            const selection = TransactionLineService.getSelectionForTag(tag);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    protected updateReconciled(e: MatCheckboxChange, transactionLine: TransactionLineMeta): void {
        this.service.updateIsReconciled(transactionLine.id, e.checked).subscribe(() => {
            this.alertService.info('Pointage mis à jour');
        });
    }
}
