import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {TransactionTagService} from '../services/transactionTag.service';

@Component({
    selector: 'app-transaction-tag',
    templateUrl: './transactionTag.component.html',
    styleUrls: ['./transactionTag.component.scss'],
})
export class TransactionTagComponent extends NaturalAbstractDetail<TransactionTagService> {
    public constructor(transactionTagService: TransactionTagService, injector: Injector) {
        super('transactionTag', transactionTagService, injector);
    }
}
