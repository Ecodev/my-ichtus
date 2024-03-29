import {Component} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {NonNullableFormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {money} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-create-refund',
    templateUrl: './create-refund.component.html',
    styleUrl: './create-refund.component.scss',
    standalone: true,
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatButtonModule,
    ],
})
export class CreateRefundComponent {
    /**
     * Form for ExpenseClaimInput
     */
    public readonly form = this.fb.group({
        amount: ['', [Validators.required, Validators.min(1), money]],
        name: ['Demande de remboursement', [Validators.required, Validators.maxLength(50)]],
        description: ['', []],
    });

    public constructor(private readonly fb: NonNullableFormBuilder) {}
}
