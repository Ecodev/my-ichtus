import {Component, inject, Input, OnInit} from '@angular/core';
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
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {transactionLines} from '../../../shared/natural-search/natural-search-facets';
import {TransactionLineService} from '../services/transactionLine.service';
import {
    ExportTransactionLinesVariables,
    MinimalAccount,
    TransactionLine,
    TransactionTag,
} from '../../../shared/generated-types';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {union} from 'es-toolkit';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

@Component({
    selector: 'app-transaction-lines',
    templateUrl: './transactionLines.component.html',
    styleUrl: './transactionLines.component.scss',
    imports: [
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MoneyComponent,
        TransactionAmountComponent,
        MatCheckboxModule,
        NaturalAvatarComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
        DatePipe,
        AsyncPipe,
    ],
})
export class TransactionLinesComponent extends NaturalAbstractList<TransactionLineService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);

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

    public readonly buttons: Button[] = [
        {
            label: `Télécharger la liste au format Excel`,
            icon: 'file_download',
            click: (): void => this.download(),
        },
    ];

    @Input() public relativeToAccount: MinimalAccount | null = null;
    @Input() public hideFab = false;

    public constructor() {
        super(inject(TransactionLineService));

        this.naturalSearchFacets = transactionLines();
    }

    public download(): void {
        const qvm = new NaturalQueryVariablesManager<ExportTransactionLinesVariables>(this.variablesManager);

        this.service.getExportLink(qvm).subscribe(url => {
            window.location.href = url;
        });
    }

    public filterByAccount(account: MinimalAccount): void {
        if (this.hideFab) {
            const link = this.service.linkToTransactionLinesForAccount(account);
            this.router.navigate(link);
        } else {
            const selection = TransactionLineService.getSelectionForAccount(account);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    public documentCount(tl: TransactionLine['transactionLine']): number {
        const transaction = tl.transaction;
        const expenseClaim = transaction.expenseClaim;

        return union(
            transaction.accountingDocuments.map(document => (document ? document.id : null)),
            expenseClaim ? expenseClaim.accountingDocuments.map(document => (document ? document.id : null)) : [],
        ).length;
    }

    public filterByTag(tag: TransactionTag['transactionTag']): void {
        if (this.hideFab) {
            const link = this.service.linkToTransactionLinesForTag(tag);
            this.router.navigate(link);
        } else {
            const selection = TransactionLineService.getSelectionForTag(tag);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    public updateReconciled(e: MatCheckboxChange, transactionLine: TransactionLine['transactionLine']): void {
        this.service.updateIsReconciled(transactionLine.id, e.checked).subscribe(() => {
            this.alertService.info('Pointage mis à jour');
        });
    }
}
