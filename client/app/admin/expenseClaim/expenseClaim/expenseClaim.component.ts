import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {CurrentUserForProfile, ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-expense-claim',
    templateUrl: './expenseClaim.component.html',
    styleUrls: ['./expenseClaim.component.scss'],
})
export class ExpenseClaimComponent extends NaturalAbstractDetail<ExpenseClaimService> implements OnInit {
    public ExpenseClaimType = ExpenseClaimType;
    public ExpenseClaimStatus = ExpenseClaimStatus;
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public constructor(
        public expenseClaimService: ExpenseClaimService,
        injector: Injector,
        public readonly userService: UserService,
        public readonly transactionLineService: TransactionLineService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('expenseClaim', expenseClaimService, injector);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;
    }

    public approve(): void {
        const reviewer = this.form.get('reviewer');
        if (reviewer) {
            reviewer.setValue(this.viewer);
            reviewer.markAsTouched();
        }
        const status = this.form.get('status');
        if (status) {
            status.setValue(ExpenseClaimStatus.processing);
            status.markAsTouched();
        }
        if (this.form.touched) {
            this.update();
        }
    }
}
