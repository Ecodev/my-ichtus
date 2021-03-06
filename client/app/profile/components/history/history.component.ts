import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {NaturalAbstractController, NaturalDataSource} from '@ecodev/natural';
import {CurrentUserForProfile_viewer, TransactionLines_transactionLines} from '../../../shared/generated-types';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent extends NaturalAbstractController implements OnInit {
    @Input() public viewer!: CurrentUserForProfile_viewer;

    public transactionLinesDS!: NaturalDataSource<TransactionLines_transactionLines>;
    public transactionsColumns = ['name', 'bookable', 'transactionDate', 'remarks', 'amount'];

    constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly transactionLineService: TransactionLineService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;

        if (this.viewer.account) {
            const transactionLinesQuery = this.transactionLineService
                .getForAccount(this.viewer.account)
                .pipe(takeUntil(this.ngUnsubscribe));
            this.transactionLinesDS = new NaturalDataSource<TransactionLines_transactionLines>(transactionLinesQuery);
        }
    }
}
