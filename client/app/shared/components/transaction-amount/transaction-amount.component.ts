import {Component, inject, Input, input, OnChanges, output} from '@angular/core';
import {AccountType, MinimalAccount, TransactionLine} from '../../generated-types';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-transaction-amount',
    imports: [CurrencyPipe, MatTooltip, RouterLink],
    templateUrl: './transaction-amount.component.html',
    styleUrl: './transaction-amount.component.scss',
})
export class TransactionAmountComponent implements OnChanges {
    public readonly transactionLineService = inject(TransactionLineService);

    @Input() public transactionLine: TransactionLine['transactionLine'] | null = null;

    /**
     * Account we want to see the amount relative to
     */
    @Input() public relativeToAccount: MinimalAccount | null = null;
    public readonly displayMode = input<'amount' | 'account'>('amount');
    public readonly accountClick = output<MinimalAccount>();

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

    protected propagateAccount(account: MinimalAccount): void {
        this.accountClick.emit(account);
    }
}
