import {Service} from '@angular/core';
import {type AbstractControl, FormControl, FormGroup, type ValidationErrors, Validators} from '@angular/forms';
import {
    formatIsoDate,
    type FormValidators,
    type Literal,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    type NaturalSearchSelections,
    toNavigationParameters,
} from '@ecodev/natural';
import {exportTransactionLines, reconcileTransactionLine, transactionLinesQuery} from './transactionLine.queries';
import {
    type ExpenseClaimQuery,
    type ExportTransactionLines,
    type ExportTransactionLinesVariables,
    type MinimalAccount,
    type ReconcileTransactionLine,
    type ReconcileTransactionLineVariables,
    type TransactionLineInput,
    type TransactionLineMeta,
    type TransactionLinesQuery,
    type TransactionLinesQueryVariables,
    type UpdatableTransactionLineInput,
} from '../../../shared/generated-types';
import {type Observable} from 'rxjs';
import {map} from 'rxjs/operators';

function addError(control: AbstractControl, key: string, value: string | null): void {
    const errors = control.errors ?? {};
    if (value) {
        errors[key] = value;
    } else {
        delete errors[key];
    }

    control.setErrors(Object.keys(errors).length ? errors : null);
}

/**
 * This is an unusual validator that works on two fields, debit and credit, at the same time.
 *
 * It must be declared on both fields, so we can show error messages properly
 * on both fields. And a single run will add errors to both fields at once,
 * so that when one field changes we can remove the error of the other field
 */
function atLeastOneAccount(debitOrCredit: AbstractControl): ValidationErrors | null {
    const formGroup = debitOrCredit.parent;
    if (!(debitOrCredit instanceof FormControl) || !(formGroup instanceof FormGroup)) {
        return null;
    }

    const debit = formGroup.controls.debit;
    const credit = formGroup.controls.credit;

    let message: string | null = null;
    if (debit.pristine && credit.pristine) {
        message = null;
    } else if (!debit.value && !credit.value) {
        message = 'Au moins un compte est requis';
    } else if (debit.value?.id == credit.value?.id) {
        message = 'Les comptes doivent être différents';
    }

    const key = 'atLeastOneAccount';
    addError(debit, key, message);
    addError(credit, key, message);

    // The rule is about the pair, so both accounts must show as wrong and not only the one touched
    if (message) {
        debit.markAsTouched({emitEvent: false});
        credit.markAsTouched({emitEvent: false});
    }

    return message ? {[key]: message} : null;
}

@Service()
export class TransactionLineService extends NaturalAbstractModelService<
    never,
    never,
    TransactionLinesQuery['transactionLines'],
    TransactionLinesQueryVariables,
    never,
    {input: TransactionLineInput},
    never,
    {id: string; input: UpdatableTransactionLineInput},
    never,
    never
> {
    public constructor() {
        super('transactionLine', null, transactionLinesQuery, null, null, null);
    }

    public static getVariablesForExport(): TransactionLinesQueryVariables {
        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                custom: {transactionExport: {value: true}},
                            },
                        ],
                    },
                ],
            },
            pagination: {pageIndex: 0, pageSize: 15000},
        };
    }

    public static getSelectionForAccount(account: MinimalAccount): NaturalSearchSelections {
        return [
            [
                {
                    field: 'custom',
                    name: 'account',
                    condition: {
                        have: {
                            values: [account.id],
                        },
                    },
                },
            ],
        ];
    }

    public static getSelectionForTag(tag: {__typename: 'TransactionTag'; id: string}): NaturalSearchSelections {
        return [
            [
                {
                    field: 'transactionTag',
                    condition: {
                        have: {
                            values: [tag.id],
                        },
                    },
                },
            ],
        ];
    }

    /**
     * Get input never returns the ID, but here we need it for lines that already exist and must be preserved.
     */
    public override getInput(
        object: Literal,
        forCreation: boolean,
    ): TransactionLineInput | UpdatableTransactionLineInput {
        const input = super.getInput(object, forCreation);

        return object.id ? {...input, id: object.id} : input;
    }

    public override getDefaultForServer(): TransactionLineInput {
        return {
            name: '',
            remarks: '',
            balance: '',
            credit: null,
            debit: null,
            bookable: null,
            isReconciled: false,
            transactionDate: formatIsoDate(new Date()),
            transactionTag: null,
        };
    }

    public linkToTransactionLinesForAccount(account: MinimalAccount): any[] {
        const selection = TransactionLineService.getSelectionForAccount(account);
        return ['/admin/transaction-line', toNavigationParameters(selection)];
    }

    public linkToTransactionLinesForTag(tag: NonNullable<TransactionLineMeta['transactionTag']>): any[] {
        const selection = TransactionLineService.getSelectionForTag(tag);
        return ['/admin/transaction-line', toNavigationParameters(selection)];
    }

    public linkToTransactionLinesForTransactions(
        transactions: ExpenseClaimQuery['expenseClaim']['transactions'],
    ): any[] {
        const selection: NaturalSearchSelections = transactions.map(transaction => [
            {
                field: 'transaction',
                condition: {
                    have: {
                        values: [transaction.id],
                    },
                },
            },
        ]);

        return ['/admin/transaction-line', toNavigationParameters(selection)];
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            balance: [Validators.required, Validators.min(0)],
            transactionDate: [Validators.required],
            credit: [atLeastOneAccount],
            debit: [atLeastOneAccount],
        };
    }

    public getForAccount(account: MinimalAccount): Observable<TransactionLinesQuery['transactionLines']> {
        const variables: TransactionLinesQueryVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                custom: {account: {values: [account.id]}},
                            },
                        ],
                    },
                ],
            },
            pagination: {pageIndex: 0, pageSize: 9999},
        };

        const qvm = new NaturalQueryVariablesManager<TransactionLinesQueryVariables>();
        qvm.set('variables', variables);
        return this.watchAll(qvm);
    }

    public getExportLink(qvm: NaturalQueryVariablesManager<ExportTransactionLinesVariables>): Observable<string> {
        qvm.merge('variables', TransactionLineService.getVariablesForExport());

        return this.apollo
            .mutate<ExportTransactionLines, ExportTransactionLinesVariables>({
                mutation: exportTransactionLines,
                variables: qvm.variables.value,
            })
            .pipe(
                map(result => {
                    return result.data!.exportTransactionLines;
                }),
            );
    }

    public updateIsReconciled(
        id: string,
        isReconciled: boolean,
    ): Observable<ReconcileTransactionLine['reconcileTransactionLine']> {
        return this.apollo
            .mutate<ReconcileTransactionLine, ReconcileTransactionLineVariables>({
                mutation: reconcileTransactionLine,
                variables: {id: id, isReconciled: isReconciled},
            })
            .pipe(
                map(result => {
                    return result.data!.reconcileTransactionLine;
                }),
            );
    }
}
