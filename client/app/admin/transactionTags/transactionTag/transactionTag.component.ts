import {NaturalErrorMessagePipe} from '@ecodev/natural';
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
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';

@Component({
    selector: 'app-transaction-tag',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        MatDivider,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatInput,
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
