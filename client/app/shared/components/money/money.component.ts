import {Component, Input} from '@angular/core';
import Big from 'big.js';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
    imports: [CommonModule],
})
export class MoneyComponent {
    /**
     * E.g mat-headline-4
     */
    @Input() public sizeClass = '';

    @Input() public amount: string | number | undefined | null = null;

    @Input() public showSignal = true;

    @Input() public showCurrency = true;

    public showPositive(): boolean {
        return this.showSignal && !!this.amount && Big(this.amount).gt(0);
    }

    public showNegative(): boolean {
        return this.showSignal && !!this.amount && Big(this.amount).lt(0);
    }
}
