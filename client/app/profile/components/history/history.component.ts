import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {NaturalAbstractController, NaturalDataSource} from '@ecodev/natural';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent extends NaturalAbstractController implements OnInit, OnDestroy {
    public viewer;

    public transactionLinesDS: NaturalDataSource;
    public transactionsColumns = ['name', 'bookable', 'transactionDate', 'remarks', 'amount'];

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private expenseClaimService: ExpenseClaimService,
        private transactionLineService: TransactionLineService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;

        if (this.viewer.account) {
            const transactionLinesQuery = this.transactionLineService.getForAccount(
                this.viewer.account,
                this.ngUnsubscribe,
            );
            this.transactionLinesDS = new NaturalDataSource(transactionLinesQuery);
        }
    }
}
