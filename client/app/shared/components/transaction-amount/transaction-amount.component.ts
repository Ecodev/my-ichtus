import {Component, EventEmitter, inject, Input, OnChanges, Output} from '@angular/core';
import {AccountType, MinimalAccount, TransactionLine} from '../../generated-types';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {RouterLink} from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-transaction-amount',
    templateUrl: './transaction-amount.component.html',
    styleUrl: './transaction-amount.component.scss',
    standalone: true,
    imports: [CommonModule, MatTooltipModule, RouterLink],
})
export class TransactionAmountComponent implements OnChanges {
    public readonly transactionLineService = inject(TransactionLineService);

    @Input() public transactionLine: TransactionLine['transactionLine'] | null = null;

    /**
     * Account we want to see the amount relative to
     */
    @Input() public relativeToAccount: MinimalAccount | null = null;
    @Input() public displayMode: 'amount' | 'account' = 'amount';
    @Output() public readonly accountClick = new EventEmitter<MinimalAccount>();

    public isIncome: boolean | null = null;

    public ngOnChanges(): void {
        const account = this.relativeToAccount;
        const transaction = this.transactionLine;
        if (account && transaction) {
            if (transaction.debit?.id === account.id) {
                // If account is at transaction debit
                this.isIncome = [AccountType.Asset, AccountType.Expense].includes(account.type);
            } else if (transaction.credit?.id === account.id) {
                // If account is at transaction credit
                this.isIncome = [AccountType.Liability, AccountType.Equity, AccountType.Revenue].includes(account.type);
            } else {
                this.isIncome = null;
            }
        }
    }

    public propagateAccount(account: MinimalAccount): void {
        this.accountClick.emit(account);
    }
}
