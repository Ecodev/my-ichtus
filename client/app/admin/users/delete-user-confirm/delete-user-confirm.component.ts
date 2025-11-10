import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {Apollo} from 'apollo-angular';
import {ApolloQueryResult, gql} from '@apollo/client/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
    DeleteUserConfirmation,
    DeleteUserConfirmationVariables,
    ExpenseClaimStatus,
} from '../../../shared/generated-types';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {escapeRegExp} from 'es-toolkit';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NaturalSearchSelections, toGraphQLDoctrineFilter, toNavigationParameters} from '@ecodev/natural';
import {accounts, expenseClaims, users} from '../../../shared/natural-search/natural-search-facets';
import {Params, RouterLink} from '@angular/router';
import {WarningComponent} from '../../../shared/warning.component';
import {CurrencyPipe} from '@angular/common';

export type DeleteUserConfirmData = {
    user: string;
};

@Component({
    imports: [
        MatDialogModule,
        MatButton,
        MatFormField,
        MatLabel,
        MatError,
        MatInput,
        ReactiveFormsModule,
        RouterLink,
        WarningComponent,
        CurrencyPipe,
    ],
    templateUrl: './delete-user-confirm.component.html',
    styleUrl: './delete-user-confirm.component.scss',
})
export class DeleteUserConfirmComponent {
    private readonly dialog = inject<MatDialogRef<boolean>>(MatDialogRef);

    public result: ApolloQueryResult<DeleteUserConfirmation> | null = null;
    public readonly form = new FormControl('', {nonNullable: true});
    public readonly accountBalanceNotZeroParams: Params;
    public readonly nonTreatedExpenseClaimParams: Params;
    public readonly familyParams: Params;

    public constructor() {
        const data = inject<DeleteUserConfirmData>(MAT_DIALOG_DATA);
        const apollo = inject(Apollo);

        const accountBalanceNotZero: NaturalSearchSelections = [
            [
                {
                    field: 'owner',
                    condition: {have: {values: [data.user]}},
                },
                {
                    field: 'balance',
                    condition: {equal: {value: 0, not: true}},
                },
            ],
        ];

        const nonTreatedExpenseClaim: NaturalSearchSelections = [
            [
                {
                    field: 'owner',
                    condition: {have: {values: [data.user]}},
                },
                {
                    field: 'status',
                    condition: {in: {values: [ExpenseClaimStatus.New, ExpenseClaimStatus.Processing]}},
                },
            ],
        ];

        const family: NaturalSearchSelections = [
            [
                {
                    field: 'owner',
                    condition: {have: {values: [data.user]}},
                },
            ],
        ];

        this.accountBalanceNotZeroParams = toNavigationParameters(accountBalanceNotZero);
        this.nonTreatedExpenseClaimParams = toNavigationParameters(nonTreatedExpenseClaim);
        this.familyParams = toNavigationParameters(family);

        apollo
            .watchQuery<DeleteUserConfirmation, DeleteUserConfirmationVariables>({
                fetchPolicy: 'cache-and-network',
                variables: {
                    userId: data.user,
                    accountFilter: toGraphQLDoctrineFilter(accounts(), accountBalanceNotZero),
                    expenseClaimFilter: toGraphQLDoctrineFilter(expenseClaims(), nonTreatedExpenseClaim),
                    userFilter: toGraphQLDoctrineFilter(users(), family),
                },
                query: gql`
                    query DeleteUserConfirmation(
                        $userId: UserID!
                        $accountFilter: AccountFilter!
                        $expenseClaimFilter: ExpenseClaimFilter!
                        $userFilter: UserFilter!
                    ) {
                        user(id: $userId) {
                            id
                            name
                        }
                        accountBalanceNotZero: accounts(filter: $accountFilter) {
                            items {
                                id
                                balance
                            }
                            length
                        }
                        nonTreatedExpenseClaim: expenseClaims(filter: $expenseClaimFilter) {
                            length
                        }
                        family: users(filter: $userFilter) {
                            length
                        }
                    }
                `,
            })
            .valueChanges.pipe(takeUntilDestroyed())
            .subscribe(result => {
                this.result = result;
                this.form.setValidators([
                    Validators.required,
                    Validators.pattern(escapeRegExp(this.result.data.user.name)),
                ]);
                this.form.updateValueAndValidity();
            });
    }

    public close(): void {
        this.dialog.close(false);
    }
}
