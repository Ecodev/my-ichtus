import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-money',
    templateUrl: './money.component.html',
})
export class MoneyComponent {
    /**
     * If user or account, display the amount
     * If transaction or expenseClaim, displays the amount
     */
    @Input() public model;

    /**
     * E.g mat-title, mat-display-2
     */
    @Input() public sizeClass;

    @Input() public amount;

    @Input() public showSignal = true;

    @Input() public showCurrency = true;

    constructor() {}
}
