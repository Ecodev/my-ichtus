import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
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
    AccountInput,
    Accounts,
    AccountsVariables,
    AccountType,
    AccountVariables,
    CreateAccount,
    CreateAccountVariables,
    DeleteAccounts,
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
    DeleteAccounts
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
}
