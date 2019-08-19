import { Component, Injector, Input, OnInit } from '@angular/core';
import { NaturalAbstractList, NaturalQueryVariablesManager } from '@ecodev/natural';
import { NaturalSearchFacetsService } from '../../../shared/natural-search/natural-search-facets.service';
import { TransactionLineService } from '../services/transactionLine.service';
import { Account, TransactionLines, TransactionLinesVariables, TransactionTag } from '../../../shared/generated-types';
import { PermissionsService } from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-transaction-lines',
    templateUrl: './transactionLines.component.html',
    styleUrls: ['./transactionLines.component.scss'],
})
export class TransactionLinesComponent extends NaturalAbstractList<TransactionLines['transactionLines'], TransactionLinesVariables>
    implements OnInit {

    @Input() relativeToAccount;
    @Input() hideFab = false;

    constructor(private transactionLineService: TransactionLineService,
                injector: Injector,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                public permissionsService: PermissionsService,
    ) {

        super(transactionLineService, injector);

        this.naturalSearchFacets = naturalSearchFacetsService.get('transactionLines');
    }

    public download(): void {
        const qvm = new NaturalQueryVariablesManager(this.variablesManager);
        qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});

        this.transactionLineService.getExportLink(qvm).subscribe(url => {
            window.location.href = url;
        });
    }

    public filterByAccount(account: Account['account']): void {
        if (this.hideFab) {
            const link = this.transactionLineService.linkToTransactionForAccount(account);
            if (typeof link === 'string') {
                this.router.navigateByUrl(link);
            } else {
                this.router.navigate(link);
            }
        } else {
            const selection = TransactionLineService.getSelectionForAccount(account);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }

    public filterByTag(tag: TransactionTag['transactionTag']): void {
        if (this.hideFab) {
            const link = this.transactionLineService.linkToTransactionForTag(tag);
            if (typeof link === 'string') {
                this.router.navigateByUrl(link);
            } else {
                this.router.navigate(link);
            }
        } else {
            const selection = TransactionLineService.getSelectionForTag(tag);
            this.naturalSearchSelections = selection;
            this.search(selection);
        }
    }
}
