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
} from './account.queries';
import {
    Account,
    AccountingClosing,
    AccountingClosingVariables,
    AccountInput,
    Accounts,
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
    NextAccountCodeVariables,
    UpdateAccount,
    UpdateAccountVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';
import {
    FormAsyncValidators,
    formatIsoDateTime,
    FormValidators,
    integer,
    money,
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
    public constructor() {
        super('account', accountQuery, accountsQuery, createAccount, updateAccount, deleteAccounts);
    }

    public override getDefaultForServer(): AccountInput {
        return {
            owner: null,
            parent: null,
            type: AccountType.Expense,
            code: 0,
            name: '',
            iban: '',
            budgetAllowed: null,
            totalBalanceFormer: '0',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            code: [Validators.required, Validators.min(0), integer],
            iban: [iban],
            totalBalanceFormer: [Validators.required, money],
            budgetAllowed: [money, Validators.min(0)],
        };
    }

    public override getFormAsyncValidators(model: Account['account']): FormAsyncValidators {
        return {
            code: [unique('code', model.id, this)],
        };
    }

    public getNextCodeAvailable(parentId: string | null): Observable<number> {
        return this.apollo
            .query<NextAccountCode, NextAccountCodeVariables>({
                query: nextCodeAvailableQuery,
                variables: {
                    parent: parentId,
                },
            })
            .pipe(map(result => result.data.nextAccountCode));
    }

    public getAccountByCode(code: number): Observable<Accounts['accounts']['items'][0]> {
        const variables: AccountsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [{code: {equal: {value: code}}}],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<AccountsVariables>();
        qvm.set('variables', variables);

        return this.getAll(qvm).pipe(
            map(res => {
                if (res.length === 1) {
                    return res.items[0];
                }

                throw new Error(`Account not found for code ${code}`);
            }),
        );
    }

    public getReportExportLink(
        date: Date,
        datePrevious: Date | null = null,
        showBudget: boolean,
    ): Observable<ExportAccountingReport['exportAccountingReport']> {
        const variables: ExportAccountingReportVariables = {
            date: formatIsoDateTime(date),
            datePrevious: datePrevious ? formatIsoDateTime(datePrevious) : null,
            showBudget: showBudget,
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
