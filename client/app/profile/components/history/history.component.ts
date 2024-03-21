import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {NaturalAbstractController, NaturalDataSource} from '@ecodev/natural';
import {CurrentUserForProfile, TransactionLines} from '../../../shared/generated-types';
import {takeUntil} from 'rxjs/operators';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrl: './history.component.scss',
    standalone: true,
    imports: [FlexModule, CommonModule, MatTableModule, TransactionAmountComponent],
})
export class HistoryComponent extends NaturalAbstractController implements OnInit {
    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public transactionLinesDS!: NaturalDataSource<TransactionLines['transactionLines']>;
    public transactionsColumns = ['name', 'bookable', 'transactionDate', 'remarks', 'amount'];

    public constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly transactionLineService: TransactionLineService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer;

        if (this.viewer.account) {
            const transactionLinesQuery = this.transactionLineService
                .getForAccount(this.viewer.account)
                .pipe(takeUntil(this.ngUnsubscribe));
            this.transactionLinesDS = new NaturalDataSource<TransactionLines['transactionLines']>(
                transactionLinesQuery,
            );
        }
    }
}
