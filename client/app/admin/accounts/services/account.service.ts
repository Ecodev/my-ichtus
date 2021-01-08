import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    accountingClosing,
    accountingReport,
    accountQuery,
    accountsQuery,
    createAccount,
    deleteAccounts,
    nextCodeAvailableQuery,
    updateAccount,
} from './account.queries';
import {
    Account,
    Account_account,
    AccountingClosing,
    AccountingClosingVariables,
    AccountingReport,
    AccountingReportVariables,
    AccountInput,
    Accounts,
    AccountsVariables,
    AccountType,
    AccountVariables,
    CreateAccount,
    CreateAccountVariables,
    DeleteAccounts,
    DeleteAccountsVariables,
    NextAccountCode,
    UpdateAccount,
    UpdateAccountVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';
import {FormAsyncValidators, FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AccountService extends NaturalAbstractModelService<
    Account['account'],
    AccountVariables,
    Accounts['accounts'],
    AccountsVariables,
    CreateAccount['createAccount'],
    CreateAccountVariables,
    UpdateAccount['updateAccount'],
    UpdateAccountVariables,
    DeleteAccounts,
    DeleteAccountsVariables
> {
    constructor(apollo: Apollo) {
        super(apollo, 'account', accountQuery, accountsQuery, createAccount, updateAccount, deleteAccounts);
    }

    protected getDefaultForServer(): AccountInput {
        return {
            owner: null,
            parent: null,
            type: AccountType.expense,
            code: 0,
            name: '',
            iban: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            code: [Validators.required, Validators.maxLength(20)],
        };
    }

    public getFormAsyncValidators(model: Account_account): FormAsyncValidators {
        return {
            code: [unique('code', model.id, this)],
        };
    }

    public getNextCodeAvailable(): Observable<number> {
        return this.apollo
            .query<NextAccountCode>({
                query: nextCodeAvailableQuery,
            })
            .pipe(
                map(result => {
                    return result.data.nextAccountCode;
                }),
            );
    }

    public getReportExportLink(date: Date): Observable<AccountingReport['accountingReport']> {
        const variables: AccountingReportVariables = {
            date: date,
        };

        return this.apollo
            .mutate<AccountingReport, AccountingReportVariables>({
                mutation: accountingReport,
                variables: variables,
            })
            .pipe(map(result => result.data!.accountingReport));
    }

    public closing(date: Date): Observable<AccountingClosing['accountingClosing']> {
        const variables: AccountingClosingVariables = {
            date: date,
        };

        return this.apollo
            .mutate<AccountingClosing>({
                mutation: accountingClosing,
                variables: variables,
            })
            .pipe(map(result => result.data!.accountingClosing));
    }
}
