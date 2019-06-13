import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractList, NaturalAlertService, NaturalPersistenceService, NaturalQueryVariablesManager } from '@ecodev/natural';
import { NaturalSearchFacetsService } from '../../../shared/natural-search/natural-search-facets.service';
import { TransactionLines, TransactionLinesVariables } from '../../../shared/generated-types';
import { TransactionLineService } from '../services/transactionLine.service';
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

    constructor(route: ActivatedRoute,
                router: Router,
                private transactionLineService: TransactionLineService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                public permissionsService: PermissionsService,
    ) {

        super(transactionLineService,
            router,
            route,
            alertService,
            persistenceService,
        );

        this.naturalSearchFacets = naturalSearchFacetsService.get('transactionLines');
    }

    public download(): void {
        const qvm = new NaturalQueryVariablesManager(this.variablesManager);
        qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});

        this.transactionLineService.getExportLink(qvm).subscribe(url => {
            window.location.href = url;
        });
    }
}
