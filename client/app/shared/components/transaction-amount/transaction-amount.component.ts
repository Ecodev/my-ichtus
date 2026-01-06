import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {AccountType, MinimalAccount, type TransactionLineMeta} from '../../generated-types';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-transaction-amount',
    imports: [CurrencyPipe, MatTooltip, RouterLink],
    templateUrl: './transaction-amount.component.html',
    styleUrl: './transaction-amount.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionAmountComponent {
    protected readonly transactionLineService = inject(TransactionLineService);

    public readonly transactionLine = input<TransactionLineMeta | null>(null);

    /**
     * Account we want to see the amount relative to
     */
    public readonly relativeToAccount = input<MinimalAccount | null>(null);
    public readonly displayMode = input<'amount' | 'account'>('amount');
    protected readonly accountClick = output<MinimalAccount>();

    protected readonly isIncome = computed<boolean | null>(() => {
        const account = this.relativeToAccount();
        const transaction = this.transactionLine();
        if (account && transaction) {
            if (transaction.debit?.id === account.id) {
                // If account is at transaction debit
                return [AccountType.Asset, AccountType.Expense].includes(account.type);
            } else if (transaction.credit?.id === account.id) {
                // If account is at transaction credit
                return [AccountType.Liability, AccountType.Equity, AccountType.Revenue].includes(account.type);
            }
        }

        return null;
    });

    protected propagateAccount(account: MinimalAccount): void {
        this.accountClick.emit(account);
    }
}
