import {Component, inject} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {TransactionTagService} from '../services/transactionTag.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';

@Component({
    selector: 'app-transaction-tag',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
    templateUrl: './transactionTag.component.html',
    styleUrl: './transactionTag.component.scss',
})
export class TransactionTagComponent extends NaturalAbstractDetail<TransactionTagService, NaturalSeoResolveData> {
    public constructor() {
        super('transactionTag', inject(TransactionTagService));
    }
}
