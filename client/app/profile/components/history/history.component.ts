import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {NaturalDataSource, TypedMatCellDef} from '@ecodev/natural';
import {CurrentUserForProfileQuery, TransactionLinesQuery} from '../../../shared/generated-types';
import {TransactionAmountComponent} from '../../../shared/components/transaction-amount/transaction-amount.component';
import {
    MatCell,
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
        TypedMatCellDef,
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
    private readonly route = inject(ActivatedRoute);
    private readonly transactionLineService = inject(TransactionLineService);

    private readonly destroyRef = inject(DestroyRef);
    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfileQuery['viewer']>;

    protected dataSource!: NaturalDataSource<TransactionLinesQuery['transactionLines']>;
    protected transactionsColumns = ['name', 'bookable', 'transactionDate', 'remarks', 'amount'];

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer;

        if (this.viewer.account) {
            const transactionLinesQuery = this.transactionLineService
                .getForAccount(this.viewer.account)
                .pipe(takeUntilDestroyed(this.destroyRef));
            this.dataSource = new NaturalDataSource<TransactionLinesQuery['transactionLines']>(transactionLinesQuery);
        }
    }
}
