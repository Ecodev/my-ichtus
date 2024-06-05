import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-accounting-closing',
    templateUrl: './accounting-closing.component.html',
    styleUrl: './accounting-closing.component.scss',
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatButtonModule,
    ],
})
export class AccountingClosingComponent {
    public readonly form = new FormControl<Date | null>(null, [Validators.required]);
    public readonly today = new Date();

    public constructor() {
        const lastYear = new Date().getFullYear() - 1;
        const date = new Date(lastYear, 11, 31);
        this.form.setValue(date);
    }
}
