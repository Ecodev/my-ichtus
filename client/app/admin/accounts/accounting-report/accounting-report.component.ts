import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';

@Component({
    selector: 'app-accounting-report',
    imports: [
        MatDialogModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatSuffix,
        MatInput,
        FormsModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        ReactiveFormsModule,
        MatButton,
        MatCheckbox,
    ],
    templateUrl: './accounting-report.component.html',
    styleUrl: './accounting-report.component.scss',
})
export class AccountingReportComponent {
    public readonly form = new FormGroup({
        date: new FormControl(new Date(), [Validators.required]),
        showBudget: new FormControl(false),
        compareWithPrevious: new FormControl(false),
        datePrevious: new FormControl(null),
    });
    public readonly today = new Date();

    protected compareCheck(e: MatCheckboxChange): void {
        if (!e.checked) {
            this.form.get('datePrevious')?.setValue(null);
        }
    }
}
