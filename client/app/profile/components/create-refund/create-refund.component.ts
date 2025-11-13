import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {money} from '@ecodev/natural';
import {MatButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';

@Component({
    selector: 'app-create-refund',
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatSuffix,
        MatInput,
        CdkTextareaAutosize,
        MatButton,
    ],
    templateUrl: './create-refund.component.html',
    styleUrl: './create-refund.component.scss',
})
export class CreateRefundComponent {
    private readonly fb = inject(NonNullableFormBuilder);

    /**
     * Form for ExpenseClaimInput
     */
    public readonly form = this.fb.group({
        amount: ['', [Validators.required, Validators.min(1), money]],
        name: ['Demande de remboursement', [Validators.required, Validators.maxLength(50)]],
        description: ['', []],
    });
}
