import {Component} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-accounting-report',
    templateUrl: './accounting-report.component.html',
    styleUrls: ['./accounting-report.component.scss'],
})
export class AccountingReportComponent {
    public readonly form = new UntypedFormControl(new Date(), [Validators.required]);
    public readonly today = new Date();
}
