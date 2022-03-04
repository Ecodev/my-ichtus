import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {
    formatIsoDateTime,
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    NaturalSearchSelections,
    toNavigationParameters,
} from '@ecodev/natural';
import {
    exportTransactionLines,
    transactionLineQuery,
    transactionLinesQuery,
    reconcileTransactionLine,
} from './transactionLine.queries';
import {
    ExpenseClaim_expenseClaim_transactions,
    ExportTransactionLines,
    ExportTransactionLinesVariables,
    MinimalAccount,
    TransactionLine,
    TransactionLineInput,
    TransactionLines,
    TransactionLinesVariables,
    TransactionLineVariables,
    TransactionTag,
    ReconcileTransactionLine,
    ReconcileTransactionLineVariables,
} from '../../../shared/generated-types';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

function atLeastOneAccount(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
        return null;
    }

    const debit = formGroup.controls.debit.value;
    const credit = formGroup.controls.credit.value;

    return debit || credit ? null : {atLeastOneAccountRequired: true};
}

@Injectable({
    providedIn: 'root',
})
export class TransactionLineService extends NaturalAbstractModelService<
    TransactionLine['transactionLine'],
    TransactionLineVariables,
    TransactionLines['transactionLines'],
    TransactionLinesVariables,
    null,
    any,
    null,
    any,
    null,
    never
> {
    public constructor(apollo: Apollo) {
        super(apollo, 'transactionLine', transactionLineQuery, transactionLinesQuery, null, null, null);
    }

    public static getVariablesForExport(): TransactionLinesVariables {
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
                    name: 'creditOrDebitAccount',
                    condition: {
                        have: {
                            values: [account.id],
                        },
                    },
                },
            ],
        ];
    }

    public static getSelectionForTag(tag: TransactionTag['transactionTag']): NaturalSearchSelections {
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

    protected getDefaultForServer(): TransactionLineInput {
        return {
            name: '',
            remarks: '',
            balance: '',
            credit: null,
            debit: null,
            bookable: null,
            isReconciled: false,
            transactionDate: formatIsoDateTime(new Date()),
            transactionTag: null,
        };
    }

    public linkToTransactionLinesForAccount(account: MinimalAccount): any[] {
        const selection = TransactionLineService.getSelectionForAccount(account);
        return ['/admin/transaction-line', toNavigationParameters(selection)];
    }

    public linkToTransactionLinesForTag(tag: TransactionTag['transactionTag']): any[] {
        const selection = TransactionLineService.getSelectionForTag(tag);
        return ['/admin/transaction-line', toNavigationParameters(selection)];
    }

    public linkToTransactionLinesForTransactions(transactions: ExpenseClaim_expenseClaim_transactions[]): any[] {
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

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            balance: [Validators.required, Validators.min(0)],
        };
    }

    /**
     * TODO : force debit or credit account as required
     */
    public getFormGroupValidators(): ValidatorFn[] {
        return [atLeastOneAccount];
    }

    public getForAccount(account: MinimalAccount): Observable<TransactionLines['transactionLines']> {
        const variables: TransactionLinesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                custom: {creditOrDebitAccount: {values: [account.id]}},
                            },
                        ],
                    },
                ],
            },
            pagination: {pageIndex: 0, pageSize: 9999},
        };

        const qvm = new NaturalQueryVariablesManager<TransactionLinesVariables>();
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
