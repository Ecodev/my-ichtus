import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-expense-claim',
    templateUrl: './expenseClaim.component.html',
    styleUrls: ['./expenseClaim.component.scss'],
})
export class ExpenseClaimComponent extends NaturalAbstractDetail<ExpenseClaimService> {
    public ExpenseClaimType = ExpenseClaimType;
    public ExpenseClaimStatus = ExpenseClaimStatus;

    constructor(
        expenseClaimService: ExpenseClaimService,
        injector: Injector,
        public readonly userService: UserService,
        public readonly transactionLineService: TransactionLineService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('expenseClaim', expenseClaimService, injector);
    }
}
