import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';
import {formatIsoDateTime, FormValidators, Literal, NaturalAbstractModelService} from '@ecodev/natural';
import {
    Accounts,
    CreateTransaction,
    CreateTransactionVariables,
    DeleteTransactions,
    DeleteTransactionsVariables,
    Transaction,
    TransactionInput,
    TransactionLineInput,
    Transactions,
    TransactionsVariables,
    TransactionVariables,
    UpdateTransaction,
    UpdateTransactionVariables,
} from '../../../shared/generated-types';
import {
    createTransaction,
    deleteTransactions,
    transactionQuery,
    transactionsQuery,
    updateTransaction,
} from './transaction.queries';
import {TransactionLineService} from './transactionLine.service';
import {localConfig} from '../../../shared/generated-config';
import {AccountService} from '../../accounts/services/account.service';

@Injectable({
    providedIn: 'root',
})
export class TransactionService extends NaturalAbstractModelService<
    Transaction['transaction'],
    TransactionVariables,
    Transactions['transactions'],
    TransactionsVariables,
    CreateTransaction['createTransaction'],
    CreateTransactionVariables,
    UpdateTransaction['updateTransaction'],
    UpdateTransactionVariables,
    DeleteTransactions,
    DeleteTransactionsVariables
> {
    private bankAccount: Accounts['accounts']['items'][0] | null = null;

    public constructor(
        private readonly transactionLineService: TransactionLineService,
        private accountService: AccountService,
    ) {
        super(
            'transaction',
            transactionQuery,
            transactionsQuery,
            createTransaction,
            updateTransaction,
            deleteTransactions,
        );

        accountService.getAccountByCode(localConfig.accounting.bankAccountCode).subscribe(res => {
            if (res.length === 1) {
                this.bankAccount = res.items[0];
            }
        });
    }

    public getRefundPreset(account: {id: string}, amount: string): TransactionLineInput[] {
        const emptyLine = this.transactionLineService.getDefaultForServer();

        const line: TransactionLineInput = {
            name: 'Remboursement du membre',
            debit: account,
            credit: this.bankAccount,
            balance: amount,
            transactionDate: formatIsoDateTime(new Date()),
        };

        return [Object.assign(emptyLine, line)];
    }

    public getExpenseClaimPreset(account: {id: string}, amount: string): TransactionLineInput[] {
        const emptyLine = this.transactionLineService.getDefaultForServer();

        const line: TransactionLineInput = {
            name: 'Remboursement sur le solde',
            debit: this.bankAccount,
            credit: account,
            balance: amount,
            transactionDate: formatIsoDateTime(new Date()),
        };

        return [Object.assign(emptyLine, line)];
    }

    public getInvoicePreset(name: string, amount: string): TransactionLineInput[] {
        const emptyLine = this.transactionLineService.getDefaultForServer();

        const line: TransactionLineInput = {
            name: name,
            debit: null,
            credit: this.bankAccount,
            balance: amount,
            transactionDate: formatIsoDateTime(new Date()),
        };

        return [Object.assign(emptyLine, line)];
    }

    protected override getFormExtraFieldDefaultValues(): Literal {
        return {
            transactionLines: null,
        };
    }

    public override getDefaultForServer(): TransactionInput {
        return {
            name: '',
            remarks: '',
            internalRemarks: '',
            transactionDate: formatIsoDateTime(new Date()),
            expenseClaim: null,
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            transactionDate: [Validators.required],
            datatransRef: [],
        };
    }

    protected override getPartialVariablesForUpdate(object: Literal): Literal {
        return {lines: object.transactionLines};
    }

    protected override getPartialVariablesForCreation(object: Literal): Literal {
        return {lines: object.transactionLines};
    }
}
