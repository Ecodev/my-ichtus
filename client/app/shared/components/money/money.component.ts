import {Component, Input} from '@angular/core';
import Big from 'big.js';

@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
})
export class MoneyComponent {
    /**
     * E.g mat-headline-4
     */
    @Input() public sizeClass = '';

    @Input() public amount: string | number | null = null;

    @Input() public showSignal = true;

    @Input() public showCurrency = true;

    public showPositive(): boolean {
        return this.showSignal && !!this.amount && Big(this.amount).gt(0);
    }

    public showNegative(): boolean {
        return this.showSignal && !!this.amount && Big(this.amount).lt(0);
    }
}
