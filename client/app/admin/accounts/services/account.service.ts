import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    accountingClosing,
    accountQuery,
    accountsQuery,
    createAccount,
    deleteAccounts,
    exportAccountingReport,
    nextCodeAvailableQuery,
    updateAccount,
    accountByCode,
} from './account.queries';
import {
    Account,
    Account_account,
    AccountByCode,
    AccountByCodeVariables,
    AccountingClosing,
    AccountingClosingVariables,
    AccountInput,
    Accounts,
    Accounts_accounts,
    AccountsVariables,
    AccountType,
    AccountVariables,
    CreateAccount,
    CreateAccountVariables,
    DeleteAccounts,
    DeleteAccountsVariables,
    ExportAccountingReport,
    ExportAccountingReportVariables,
    NextAccountCode,
    UpdateAccount,
    UpdateAccountVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';
import {
    FormAsyncValidators,
    formatIsoDateTime,
    FormValidators,
    integer,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    unique,
} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {iban} from '../../../shared/validators';

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
            code: [Validators.required, Validators.min(0), integer],
            iban: [iban],
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

    public getAccountByCode(code: number): Observable<Accounts_accounts> {
        const variables: AccountByCodeVariables = {
            filter: {
                groups: [
                    {
                        conditions: [{code: {equal: {value: code}}}],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<AccountByCodeVariables>();
        qvm.set('variables', variables);

        return this.getAll(qvm);
    }

    public getReportExportLink(date: Date): Observable<ExportAccountingReport['exportAccountingReport']> {
        const variables: ExportAccountingReportVariables = {
            date: formatIsoDateTime(date),
        };

        return this.apollo
            .mutate<ExportAccountingReport, ExportAccountingReportVariables>({
                mutation: exportAccountingReport,
                variables: variables,
            })
            .pipe(map(result => result.data!.exportAccountingReport));
    }

    public closing(date: Date): Observable<AccountingClosing['accountingClosing']> {
        const variables: AccountingClosingVariables = {
            date: formatIsoDateTime(date),
        };

        return this.apollo
            .mutate<AccountingClosing>({
                mutation: accountingClosing,
                variables: variables,
            })
            .pipe(map(result => result.data!.accountingClosing));
    }
}
