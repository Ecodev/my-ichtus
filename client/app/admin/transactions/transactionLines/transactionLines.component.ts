import {Component, Input, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractList,
    NaturalQueryVariablesManager,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    NaturalAvatarComponent,
    NaturalFixedButtonComponent,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {TransactionLineService} from '../services/transactionLine.service';
import {
    ExportTransactionLinesVariables,
    MinimalAccount,
    TransactionLine,
    TransactionTag,
} from '../../../shared/generated-types';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {union} from 'lodash-es';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-transaction-lines',
    templateUrl: './transactionLines.component.html',
    styleUrls: ['./transactionLines.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FlexModule,
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
        NaturalSwissDatePipe,
    ],
})
export class TransactionLinesComponent extends NaturalAbstractList<TransactionLineService> implements OnInit {
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

    public constructor(
        private readonly transactionLineService: TransactionLineService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(transactionLineService);

        this.naturalSearchFacets = naturalSearchFacetsService.get('transactionLines');
    }

    public download(): void {
        const qvm = new NaturalQueryVariablesManager<ExportTransactionLinesVariables>(this.variablesManager);

        this.transactionLineService.getExportLink(qvm).subscribe(url => {
            window.location.href = url;
        });
    }

    public filterByAccount(account: MinimalAccount): void {
        if (this.hideFab) {
            const link = this.transactionLineService.linkToTransactionLinesForAccount(account);
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
            const link = this.transactionLineService.linkToTransactionLinesForTag(tag);
            this.router.navigate(link);
        } else {
            const selection = TransactionLineService.getSelectionForTag(tag);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    public updateReconciled(e: MatCheckboxChange, transactionLine: TransactionLine['transactionLine']): void {
        this.transactionLineService.updateIsReconciled(transactionLine.id, e.checked).subscribe(() => {
            this.alertService.info('Pointage mis à jour');
        });
    }
}
