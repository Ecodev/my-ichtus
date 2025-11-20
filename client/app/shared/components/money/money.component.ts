import {Component, input} from '@angular/core';
import Big from 'big.js';
import {CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-money',
    imports: [CurrencyPipe],
    templateUrl: './money.component.html',
    styleUrl: './money.component.scss',
})
export class MoneyComponent {
    /**
     * E.g mat-headline-4
     */
    public readonly sizeClass = input('');

    public readonly amount = input<string | number | undefined | null>(null);

    public readonly showSignal = input(true);

    public readonly showCurrency = input(true);

    protected showPositive(): boolean {
        const amount = this.amount();
        return this.showSignal() && !!amount && Big(amount).gt(0);
    }

    protected showNegative(): boolean {
        const amount = this.amount();
        return this.showSignal() && !!amount && Big(amount).lt(0);
    }
}
