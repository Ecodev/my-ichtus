import {Component, Injector, Input, OnInit} from '@angular/core';
import {NaturalAbstractList, NaturalQueryVariablesManager} from '@ecodev/natural';
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

@Component({
    selector: 'app-transaction-lines',
    templateUrl: './transactionLines.component.html',
    styleUrls: ['./transactionLines.component.scss'],
})
export class TransactionLinesComponent extends NaturalAbstractList<TransactionLineService> implements OnInit {
    @Input() public relativeToAccount: MinimalAccount | null = null;
    @Input() public hideFab = false;

    constructor(
        private transactionLineService: TransactionLineService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(transactionLineService, injector);

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
}
