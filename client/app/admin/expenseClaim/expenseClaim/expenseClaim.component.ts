import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-expense-claim',
    templateUrl: './expenseClaim.component.html',
    styleUrls: ['./expenseClaim.component.scss'],
})
export class ExpenseClaimComponent extends NaturalAbstractDetail<ExpenseClaimService> {
    public ExpenseClaimType = ExpenseClaimType;

    constructor(expenseClaimService: ExpenseClaimService, injector: Injector, public userService: UserService) {
        super('expenseClaim', expenseClaimService, injector);
    }
}
