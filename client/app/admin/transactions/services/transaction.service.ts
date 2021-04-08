import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Validators} from '@angular/forms';
import {FormValidators, Literal, NaturalAbstractModelService} from '@ecodev/natural';
import {
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
    constructor(apollo: Apollo, private readonly transactionLineService: TransactionLineService) {
        super(
            apollo,
            'transaction',
            transactionQuery,
            transactionsQuery,
            createTransaction,
            updateTransaction,
            deleteTransactions,
        );
    }

    public getRefundPreset(account: {id: string}, amount: string): TransactionLineInput[] {
        const emptyLine = this.transactionLineService.getConsolidatedForClient();

        const line: TransactionLineInput = {
            name: 'Remboursement du membre',
            debit: account,
            credit: {id: '10025', name: 'Postfinance'},
            balance: amount,
            transactionDate: new Date(),
        };

        return [Object.assign(emptyLine, line)];
    }

    public getExpenseClaimPreset(account: {id: string}, amount: string): TransactionLineInput[] {
        const emptyLine = this.transactionLineService.getConsolidatedForClient();

        const line: TransactionLineInput = {
            name: 'Remboursement sur le solde',
            debit: {id: '10025', name: 'Postfinance'},
            credit: account,
            balance: amount,
            transactionDate: new Date(),
        };

        return [Object.assign(emptyLine, line)];
    }

    protected getDefaultForServer(): TransactionInput {
        return {
            name: '',
            remarks: '',
            internalRemarks: '',
            transactionDate: new Date(),
            expenseClaim: null,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            datatransRef: [],
        };
    }

    protected getPartialVariablesForUpdate(object: Literal): Literal {
        return {lines: object.transactionLines};
    }

    protected getPartialVariablesForCreation(object: Literal): Literal {
        return {lines: object.transactionLines};
    }
}
