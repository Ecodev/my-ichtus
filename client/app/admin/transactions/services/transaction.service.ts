import {inject, Injectable} from '@angular/core';
import {Validators} from '@angular/forms';
import {formatIsoDateTime, type FormValidators, type Literal, NaturalAbstractModelService} from '@ecodev/natural';
import {
    type AccountsQuery,
    type CreateTransaction,
    type CreateTransactionVariables,
    type DeleteTransactions,
    type DeleteTransactionsVariables,
    type TransactionInput,
    type TransactionLineInput,
    type TransactionQuery,
    type TransactionQueryVariables,
    type TransactionsQuery,
    type TransactionsQueryVariables,
    type UpdateTransaction,
    type UpdateTransactionVariables,
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
import {type Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class TransactionService extends NaturalAbstractModelService<
    TransactionQuery['transaction'],
    TransactionQueryVariables,
    TransactionsQuery['transactions'],
    TransactionsQueryVariables,
    CreateTransaction['createTransaction'],
    CreateTransactionVariables,
    UpdateTransaction['updateTransaction'],
    UpdateTransactionVariables,
    DeleteTransactions,
    DeleteTransactionsVariables
> {
    private readonly transactionLineService = inject(TransactionLineService);
    private readonly accountService = inject(AccountService);
    private readonly bankAccount: Observable<AccountsQuery['accounts']['items'][0]>;

    public constructor() {
        super(
            'transaction',
            transactionQuery,
            transactionsQuery,
            createTransaction,
            updateTransaction,
            deleteTransactions,
        );

        this.bankAccount = this.accountService.getAccountByCode(localConfig.accounting.bankAccountCode);
    }

    public getRefundPreset(account: {id: string}, amount: string): Observable<TransactionLineInput> {
        return this.bankAccount.pipe(
            map(bankAccount => {
                const emptyLine = this.transactionLineService.getDefaultForServer();

                const line: TransactionLineInput = {
                    name: 'Remboursement du membre',
                    debit: account,
                    credit: bankAccount,
                    balance: amount,
                    transactionDate: formatIsoDateTime(new Date()),
                };

                return Object.assign(emptyLine, line);
            }),
        );
    }

    public getExpenseClaimPreset(account: {id: string}, amount: string): Observable<TransactionLineInput> {
        return this.bankAccount.pipe(
            map(bankAccount => {
                const emptyLine = this.transactionLineService.getDefaultForServer();

                const line: TransactionLineInput = {
                    name: 'Remboursement sur le solde',
                    debit: bankAccount,
                    credit: account,
                    balance: amount,
                    transactionDate: formatIsoDateTime(new Date()),
                };

                return Object.assign(emptyLine, line);
            }),
        );
    }

    public getInvoicePreset(name: string, amount: string): Observable<TransactionLineInput> {
        return this.bankAccount.pipe(
            map(bankAccount => {
                const emptyLine = this.transactionLineService.getDefaultForServer();

                const line: TransactionLineInput = {
                    name: name,
                    debit: null,
                    credit: bankAccount,
                    balance: amount,
                    transactionDate: formatIsoDateTime(new Date()),
                };

                return Object.assign(emptyLine, line);
            }),
        );
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
            name: [Validators.maxLength(100)],
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
