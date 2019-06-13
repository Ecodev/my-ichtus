import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { NaturalAbstractModelService, FormValidators } from '@ecodev/natural';
import { transactionLineQuery, transactionLinesQuery, transactionLinesForExportQuery } from './transactionLine.queries';
import {
    Account,
    LogicalOperator,
    SortingOrder,
    TransactionLine,
    TransactionLineInput,
    TransactionLines,
    TransactionLineSortingField,
    TransactionLinesVariables,
    TransactionLineVariables,
} from '../../../shared/generated-types';
import { FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject} from 'rxjs';
import { map } from 'rxjs/operators';
import { NaturalQueryVariablesManager, NaturalUtility } from '@ecodev/natural';

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
export class TransactionLineService extends NaturalAbstractModelService<TransactionLine['transactionLine'],
    TransactionLineVariables,
    TransactionLines['transactionLines'],
    TransactionLinesVariables,
    null,
    any,
    null,
    any,
    null> {

    constructor(apollo: Apollo) {
        super(apollo,
            'transactionLine',
            transactionLineQuery,
            transactionLinesQuery,
            null,
            null,
            null);
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

    public getForAccount(account: Account['account'], expire: Subject<void>): Observable<TransactionLines['transactionLines']> {

        const variables: TransactionLinesVariables = {
            filter: {
                groups: [
                    {
                        conditionsLogic: LogicalOperator.OR,
                        conditions: [
                            {credit: {equal: {value: account.id}}},
                            {debit: {equal: {value: account.id}}},
                        ],
                    },

                ],
            },
            sorting: [{field: TransactionLineSortingField.transactionDate, order: SortingOrder.DESC}],
            pagination: {pageIndex: 0, pageSize: 9999},
        };

        const qvm = new NaturalQueryVariablesManager<TransactionLinesVariables>();
        qvm.set('variables', variables);
        return this.watchAll(qvm, expire);
    }

    public getExportLink(qvm: NaturalQueryVariablesManager<TransactionLinesVariables>): Observable<string> {

        return this.apollo.query<any>({
           query: transactionLinesForExportQuery,
           variables: qvm.variables.value,
        }).pipe(map(result => {
            const plural = NaturalUtility.makePlural(this.name);
            return result.data[plural].excelExport;
        }));

    }
}
