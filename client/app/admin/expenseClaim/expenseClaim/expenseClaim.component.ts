import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {
    CreateExpenseClaim,
    CreateExpenseClaimVariables,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables,
    ExpenseClaim,
    ExpenseClaimType,
    ExpenseClaimVariables,
    UpdateExpenseClaim,
    UpdateExpenseClaimVariables,
} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-expense-claim',
    templateUrl: './expenseClaim.component.html',
    styleUrls: ['./expenseClaim.component.scss'],
})
export class ExpenseClaimComponent extends NaturalAbstractDetail<
    ExpenseClaim['expenseClaim'],
    ExpenseClaimVariables,
    CreateExpenseClaim['createExpenseClaim'],
    CreateExpenseClaimVariables,
    UpdateExpenseClaim['updateExpenseClaim'],
    UpdateExpenseClaimVariables,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables
> {
    public ExpenseClaimType = ExpenseClaimType;

    constructor(expenseClaimService: ExpenseClaimService, injector: Injector, public userService: UserService) {
        super('expenseClaim', expenseClaimService, injector);
    }
}
