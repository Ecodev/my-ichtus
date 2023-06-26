import {Component, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {TransactionTagService} from '../services/transactionTag.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-transaction-tags',
    templateUrl: './transactionTags.component.html',
    styleUrls: ['./transactionTags.component.scss'],
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
