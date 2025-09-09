import {Component} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';

@Component({
    selector: 'app-accounting-report',
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
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

    public compareCheck(e: MatCheckboxChange): void {
        if (!e.checked) {
            this.form.get('datePrevious')?.setValue(null);
        }
    }
}
