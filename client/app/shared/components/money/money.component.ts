import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
})
export class MoneyComponent {
    /**
     * E.g mat-title, mat-display-2
     */
    @Input() public sizeClass = '';

    @Input() public amount: string | number | null = null;

    @Input() public showSignal = true;

    @Input() public showCurrency = true;

    constructor() {}
}
