import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {AccountType, MinimalAccount, TransactionLine} from '../../generated-types';
import {TransactionLineService} from '../../../admin/transactions/services/transactionLine.service';

@Component({
    selector: 'app-transaction-amount',
    templateUrl: './transaction-amount.component.html',
    styleUrls: ['./transaction-amount.component.scss'],
})
export class TransactionAmountComponent implements OnChanges {
    @Input() public transactionLine: TransactionLine['transactionLine'] | null = null;

    /**
     * Account we want to see the amount relative to
     */
    @Input() public relativeToAccount: MinimalAccount | null = null;
    @Input() public displayMode: 'amount' | 'account' = 'amount';
    @Output() public readonly accountClick = new EventEmitter<MinimalAccount>();

    public isIncome: boolean | null = null;

    public constructor(public readonly transactionLineService: TransactionLineService) {}

    public ngOnChanges(): void {
        const account = this.relativeToAccount;
        const transaction = this.transactionLine;
        if (account && transaction) {
            if (transaction.debit && account.id === transaction.debit.id) {
                // If account is at transaction debit
                this.isIncome = [AccountType.asset, AccountType.expense].indexOf(account.type) > -1;
            } else if (transaction.credit && account.id === transaction.credit.id) {
                // If account is at transaction credit
                this.isIncome =
                    [AccountType.liability, AccountType.equity, AccountType.revenue].indexOf(account.type) > -1;
            } else {
                this.isIncome = null;
            }
        }
    }

    public propagateAccount(account: MinimalAccount): void {
        this.accountClick.emit(account);
    }
}
