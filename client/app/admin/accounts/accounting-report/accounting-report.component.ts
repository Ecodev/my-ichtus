import {Component} from '@angular/core';
import {UntypedFormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-accounting-report',
    templateUrl: './accounting-report.component.html',
    styleUrls: ['./accounting-report.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        FlexModule,
        MatInputModule,
        FormsModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        NgIf,
        MatButtonModule,
    ],
})
export class AccountingReportComponent {
    public readonly form = new UntypedFormControl(new Date(), [Validators.required]);
    public readonly today = new Date();
}
