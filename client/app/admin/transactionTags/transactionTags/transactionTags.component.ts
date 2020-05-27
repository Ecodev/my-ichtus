import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {TransactionTags, TransactionTagsVariables} from '../../../shared/generated-types';
import {TransactionTagService} from '../services/transactionTag.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-transaction-tags',
    templateUrl: './transactionTags.component.html',
    styleUrls: ['./transactionTags.component.scss'],
})
export class TransactionTagsComponent
    extends NaturalAbstractList<TransactionTags['transactionTags'], TransactionTagsVariables>
    implements OnInit {
    constructor(
        transactionTagService: TransactionTagService,
        injector: Injector,
        public permissionsService: PermissionsService,
        public transactionLineService: TransactionLineService,
    ) {
        super(transactionTagService, injector);
    }
}
