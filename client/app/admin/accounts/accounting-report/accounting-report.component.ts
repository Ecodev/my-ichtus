import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-accounting-report',
    templateUrl: './accounting-report.component.html',
    styleUrls: ['./accounting-report.component.scss'],
})
export class AccountingReportComponent {
    public readonly form = new FormControl(new Date(), [Validators.required]);
}
