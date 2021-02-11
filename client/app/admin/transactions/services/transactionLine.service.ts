import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    NaturalSearchSelections,
    toUrl,
} from '@ecodev/natural';
import {transactionLineQuery, exportTransactionLines, transactionLinesQuery} from './transactionLine.queries';
import {
    LogicalOperator,
    ExportTransactionLines,
    ExportTransactionLinesVariables,
    MinimalAccount,
    TransactionLine,
    TransactionLineInput,
    TransactionLines,
    TransactionLinesVariables,
    TransactionLineVariables,
    TransactionTag,
} from '../../../shared/generated-types';
import {Observable, Subject} from 'rxjs';
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
    constructor(apollo: Apollo) {
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
                    field: 'debit',
                    condition: {
                        have: {
                            values: [account.id],
                        },
                    },
                },
            ],
            [
                {
                    field: 'credit',
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
            transactionDate: new Date(),
            transactionTag: null,
        };
    }

    public linkToTransactionForAccount(account: MinimalAccount): any[] {
        const selection = TransactionLineService.getSelectionForAccount(account);
        return ['/admin/transaction-line', {ns: JSON.stringify(toUrl(selection))}];
    }

    public linkToTransactionForTag(tag: TransactionTag['transactionTag']): any[] {
        const selection = TransactionLineService.getSelectionForTag(tag);
        return ['/admin/transaction-line', {ns: JSON.stringify(toUrl(selection))}];
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

    public getForAccount(
        account: MinimalAccount,
        expire: Subject<void>,
    ): Observable<TransactionLines['transactionLines']> {
        const variables: TransactionLinesVariables = {
            filter: {
                groups: [
                    {
                        conditionsLogic: LogicalOperator.OR,
                        conditions: [{credit: {equal: {value: account.id}}}, {debit: {equal: {value: account.id}}}],
                    },
                ],
            },
            pagination: {pageIndex: 0, pageSize: 9999},
        };

        const qvm = new NaturalQueryVariablesManager<TransactionLinesVariables>();
        qvm.set('variables', variables);
        return this.watchAll(qvm, expire);
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
}
