import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckbox, type MatCheckboxChange} from '@angular/material/checkbox';
import {DateAdapter} from '@angular/material/core';

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
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AccountingReportComponent {
    private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

    protected readonly form = new FormGroup({
        date: new FormControl(new Date(), [Validators.required]),
        showBudget: new FormControl(false),
        compareWithPrevious: new FormControl(false),
        datePrevious: new FormControl<Date | null>(null),
    });
    protected readonly today = new Date();

    protected compareCheck(e: MatCheckboxChange): void {
        if (!e.checked) {
            this.form.controls.datePrevious.setValue(null);
        }
    }

    /**
     * Comparing the report with itself on the same day totals nothing, so the previous date stops
     * the day before the date of the report.
     */
    protected getDatePreviousMax(): Date | null {
        const date = this.form.controls.date.value;

        return date ? this.dateAdapter.addCalendarDays(date, -1) : null;
    }
}
