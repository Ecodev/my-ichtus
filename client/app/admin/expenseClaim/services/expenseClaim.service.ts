import {Injectable} from '@angular/core';
import {type FormValidators, NaturalAbstractModelService, unsignedMoney} from '@ecodev/natural';
import {
    createExpenseClaim,
    deleteExpenseClaims,
    expenseClaimQuery,
    expenseClaimsQuery,
    updateExpenseClaim,
} from './expenseClaim.queries';
import {
    type CreateExpenseClaim,
    type CreateExpenseClaimVariables,
    type CurrentUserForProfileQuery,
    type DeleteExpenseClaims,
    type DeleteExpenseClaimsVariables,
    type ExpenseClaimInput,
    type ExpenseClaimQuery,
    type ExpenseClaimQueryVariables,
    ExpenseClaimSortingField,
    type ExpenseClaimsQuery,
    type ExpenseClaimsQueryVariables,
    ExpenseClaimStatus,
    ExpenseClaimType,
    SortingOrder,
    type UpdateExpenseClaim,
    type UpdateExpenseClaimVariables,
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
            amount: [Validators.required, Validators.min(1), unsignedMoney],
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
