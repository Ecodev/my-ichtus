import {Injectable} from '@angular/core';
import {FormValidators, money, NaturalAbstractModelService} from '@ecodev/natural';
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
    CurrentUserForProfileQuery,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables,
    ExpenseClaimQuery,
    ExpenseClaimInput,
    ExpenseClaimsQuery,
    ExpenseClaimSortingField,
    ExpenseClaimStatus,
    ExpenseClaimsQueryVariables,
    ExpenseClaimType,
    ExpenseClaimQueryVariables,
    SortingOrder,
    UpdateExpenseClaim,
    UpdateExpenseClaimVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimService extends NaturalAbstractModelService<
    ExpenseClaimQuery['expenseClaim'],
    ExpenseClaimQueryVariables,
    ExpenseClaimsQuery['expenseClaims'],
    ExpenseClaimsQueryVariables,
    CreateExpenseClaim['createExpenseClaim'],
    CreateExpenseClaimVariables,
    UpdateExpenseClaim['updateExpenseClaim'],
    UpdateExpenseClaimVariables,
    DeleteExpenseClaims,
    DeleteExpenseClaimsVariables
> {
    public constructor() {
        super(
            'expenseClaim',
            expenseClaimQuery,
            expenseClaimsQuery,
            createExpenseClaim,
            updateExpenseClaim,
            deleteExpenseClaims,
        );
    }

    public override getDefaultForServer(): ExpenseClaimInput {
        return {
            name: '',
            owner: null,
            reviewer: null,
            amount: '0',
            sector: '',
            description: '',
            remarks: '',
            internalRemarks: '',
            status: ExpenseClaimStatus.New,
            type: ExpenseClaimType.ExpenseClaim,
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            amount: [Validators.required, money, Validators.min(1)],
        };
    }

    public getForUserVariables(user: NonNullable<CurrentUserForProfileQuery['viewer']>): ExpenseClaimsQueryVariables {
        const variables: ExpenseClaimsQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                owner: {equal: {value: user.id}},
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: ExpenseClaimSortingField.creationDate, order: SortingOrder.DESC}],
        };

        return variables;
    }

    public getSectors(): string[] {
        return [
            'aviron',
            'bateau moteur',
            'canoë & kayak',
            'emplacements de stockage',
            'gilet et combis',
            'locaux',
            'NFT',
            'outillage',
            'planche à voile',
            'stand up paddle',
            'voile légère',
            'voiliers lestés',
            'wingfoil',
        ];
    }
}
