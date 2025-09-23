import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {NaturalDataSource} from '@ecodev/natural';
import {CurrentUserForProfile, TransactionLines} from '../../../shared/generated-types';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-history',
    imports: [
        DatePipe,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        TransactionAmountComponent,
    ],
    templateUrl: './history.component.html',
    styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
    private readonly userService = inject(UserService);
    private readonly route = inject(ActivatedRoute);
    private readonly expenseClaimService = inject(ExpenseClaimService);
    private readonly transactionLineService = inject(TransactionLineService);

    private readonly destroyRef = inject(DestroyRef);
    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public transactionLinesDS!: NaturalDataSource<TransactionLines['transactionLines']>;
    public transactionsColumns = ['name', 'bookable', 'transactionDate', 'remarks', 'amount'];

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer;

        if (this.viewer.account) {
            const transactionLinesQuery = this.transactionLineService
                .getForAccount(this.viewer.account)
                .pipe(takeUntilDestroyed(this.destroyRef));
            this.transactionLinesDS = new NaturalDataSource<TransactionLines['transactionLines']>(
                transactionLinesQuery,
            );
        }
    }
}
