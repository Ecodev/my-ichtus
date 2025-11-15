import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-accounting-closing',
    imports: [
        MatDialogModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatHint,
        MatSuffix,
        MatInput,
        FormsModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        ReactiveFormsModule,
        MatButton,
    ],
    templateUrl: './accounting-closing.component.html',
    styleUrl: './accounting-closing.component.scss',
})
export class AccountingClosingComponent {
    protected readonly form = new FormControl<Date | null>(null, [Validators.required]);
    protected readonly today = new Date();

    public constructor() {
        const lastYear = new Date().getFullYear() - 1;
        const date = new Date(lastYear, 11, 31);
        this.form.setValue(date);
    }
}
