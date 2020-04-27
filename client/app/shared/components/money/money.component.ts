import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
})
export class MoneyComponent {

    /**
     * If user or account, display the amount
     * If transaction or expenseClaim, displays the amount
     */
    @Input() model;

    /**
     * E.g mat-title, mat-display-2
     */
    @Input() sizeClass;

    @Input() amount;

    @Input() showSignal = true;

    @Input() showCurrency = true;

    constructor() {
    }

}
