import {Injectable} from '@angular/core';
import {FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {
    FormValidators,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    NaturalSearchSelections,
    makePlural,
    toUrl,
} from '@ecodev/natural';
import {Apollo} from 'apollo-angular';
import {transactionLineQuery, transactionLinesForExportQuery, transactionLinesQuery} from './transactionLine.queries';
import {
    Account,
    LogicalOperator,
    TransactionLine,
    TransactionLineInput,
    TransactionLines,
    TransactionLinesForExport,
    TransactionLinesForExportVariables,
    TransactionLinesVariables,
    TransactionLineVariables,
    TransactionTag,
} from '../../../shared/generated-types';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {RouterLink} from '@angular/router';

function atLeastOneAccount(formGroup: FormGroup): ValidationErrors | null {
    if (!formGroup || !formGroup.controls) {
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
    null
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

    public static getSelectionForAccount(account: Account['account']): NaturalSearchSelections {
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

    public linkToTransactionForAccount(account: Account['account']): RouterLink['routerLink'] {
        const selection = TransactionLineService.getSelectionForAccount(account);
        return ['/admin/transaction-line', {ns: JSON.stringify(toUrl(selection))}];
    }

    public linkToTransactionForTag(tag: TransactionTag['transactionTag']): RouterLink['routerLink'] {
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
        account: Account['account'],
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

    public getExportLink(qvm: NaturalQueryVariablesManager<TransactionLinesForExportVariables>): Observable<string> {
        qvm.merge('variables', TransactionLineService.getVariablesForExport());

        return this.apollo
            .query<TransactionLinesForExport, TransactionLinesForExportVariables>({
                query: transactionLinesForExportQuery,
                variables: qvm.variables.value,
            })
            .pipe(
                map(result => {
                    const plural = makePlural(this.name);
                    return result.data[plural].excelExport;
                }),
            );
    }
}
