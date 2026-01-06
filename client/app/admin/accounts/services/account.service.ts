import {Injectable} from '@angular/core';
import {
    accountQuery,
    accountsQuery,
    closeAccounting,
    createAccount,
    deleteAccounts,
    exportAccountingReport,
    nextCodeAvailableQuery,
    updateAccount,
} from './account.queries';
import {
    AccountInput,
    AccountQuery,
    AccountQueryVariables,
    AccountsQuery,
    AccountsQueryVariables,
    AccountType,
    CloseAccounting,
    CloseAccountingVariables,
    CreateAccount,
    CreateAccountVariables,
    DeleteAccounts,
    DeleteAccountsVariables,
    ExportAccountingReport,
    ExportAccountingReportVariables,
    NextAccountCodeQuery,
    NextAccountCodeQueryVariables,
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
    AccountQuery['account'],
    AccountQueryVariables,
    AccountsQuery['accounts'],
    AccountsQueryVariables,
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

    public override getFormAsyncValidators(model: AccountQuery['account']): FormAsyncValidators {
        return {
            code: [unique('code', model.id, this)],
        };
    }

    public getNextCodeAvailable(parentId: string | null): Observable<number> {
        return this.apollo
            .query<NextAccountCodeQuery, NextAccountCodeQueryVariables>({
                query: nextCodeAvailableQuery,
                variables: {
                    parent: parentId,
                },
            })
            .pipe(map(result => result.data.nextAccountCode));
    }

    public getAccountByCode(code: number): Observable<AccountsQuery['accounts']['items'][0]> {
        const variables: AccountsQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [{code: {equal: {value: code}}}],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<AccountsQueryVariables>();
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

    public closing(date: Date): Observable<CloseAccounting['closeAccounting']> {
        return this.apollo
            .mutate<CloseAccounting, CloseAccountingVariables>({
                mutation: closeAccounting,
                variables: {
                    date: formatIsoDateTime(date),
                },
            })
            .pipe(map(result => result.data!.closeAccounting));
    }
}
