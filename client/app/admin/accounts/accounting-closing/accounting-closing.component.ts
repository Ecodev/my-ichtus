import {Component} from '@angular/core';
import {UntypedFormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-accounting-closing',
    templateUrl: './accounting-closing.component.html',
    styleUrls: ['./accounting-closing.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        CommonModule,
        MatButtonModule,
    ],
})
export class AccountingClosingComponent {
    public readonly form = new UntypedFormControl(null, [Validators.required]);
    public readonly today = new Date();

    public constructor() {
        const lastYear = new Date().getFullYear() - 1;
        const date = new Date(lastYear, 11, 31);
        this.form.setValue(date);
    }
}
