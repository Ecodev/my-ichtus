import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-accounting-closing',
    templateUrl: './accounting-closing.component.html',
    styleUrls: ['./accounting-closing.component.scss'],
})
export class AccountingClosingComponent {
    public readonly form = new FormControl(null, [Validators.required]);
    public readonly today = new Date();

    constructor() {
        const lastYear = new Date().getFullYear() - 1;
        const date = new Date(lastYear, 11, 31);
        this.form.setValue(date);
    }
}
