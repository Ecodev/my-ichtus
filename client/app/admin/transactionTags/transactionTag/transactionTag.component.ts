import {Component} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
    NaturalSeoResolveData,
} from '@ecodev/natural';
import {TransactionTagService} from '../services/transactionTag.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-transaction-tag',
    templateUrl: './transactionTag.component.html',
    styleUrl: './transactionTag.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,

        MatFormFieldModule,
        MatInputModule,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class TransactionTagComponent extends NaturalAbstractDetail<TransactionTagService, NaturalSeoResolveData> {
    public constructor(transactionTagService: TransactionTagService) {
        super('transactionTag', transactionTagService);
    }
}
