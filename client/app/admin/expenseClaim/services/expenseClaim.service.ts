import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { FormValidators, NaturalAbstractModelService, NaturalQueryVariablesManager } from '@ecodev/natural';
import {
    createExpenseClaim,
    deleteExpenseClaims,
    expenseClaimQuery,
    expenseClaimsQuery,
    updateExpenseClaim,
} from './expenseClaim.queries';
import {
    CreateExpenseClaim,
    CreateExpenseClaimVariables,
    DeleteExpenseClaims,
    ExpenseClaim,
    ExpenseClaimInput,
    ExpenseClaims,
    ExpenseClaimStatus,
    ExpenseClaimsVariables,
    ExpenseClaimType,
    ExpenseClaimVariables,
    UpdateExpenseClaim,
    UpdateExpenseClaimVariables,
} from '../../../shared/generated-types';
import { Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimService extends NaturalAbstractModelService<ExpenseClaim['expenseClaim'],
    ExpenseClaimVariables,
    ExpenseClaims['expenseClaims'],
    ExpenseClaimsVariables,
    CreateExpenseClaim['createExpenseClaim'],
    CreateExpenseClaimVariables,
    UpdateExpenseClaim['updateExpenseClaim'],
    UpdateExpenseClaimVariables,
    DeleteExpenseClaims> {

    constructor(apollo: Apollo) {
        super(apollo,
            'expenseClaim',
            expenseClaimQuery,
            expenseClaimsQuery,
            createExpenseClaim,
            updateExpenseClaim,
            deleteExpenseClaims);
    }

    protected getDefaultForServer(): ExpenseClaimInput {
        return {
            name: '',
            owner: null,
            amount: '0',
            description: '',
            remarks: '',
            internalRemarks: '',
            status: ExpenseClaimStatus.new,
            type: ExpenseClaimType.expenseClaim,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            amount: [Validators.min(0)],
        };
    }

    public getForUser(user, expire: Subject<void>): Observable<ExpenseClaims['expenseClaims']> {
        const variables: ExpenseClaimsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                owner: {equal: {value: user.id}},
                                // status: {equal: {value: BookingStatus.application}}, ?? all ? or just pending ones ?
                            },
                        ],
                    },
                ],
            },
        };

        const qvm = new NaturalQueryVariablesManager<ExpenseClaimsVariables>();
        qvm.set('variables', variables);
        return this.watchAll(qvm, expire);
    }

}
