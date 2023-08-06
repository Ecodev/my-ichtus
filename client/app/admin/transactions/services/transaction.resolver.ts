import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, last, map, Observable, of} from 'rxjs';
import {DuplicatedTransactionResolve, TransactionResolve} from '../transaction';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionService} from './transaction.service';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {TransactionLineService} from './transactionLine.service';

/**
 * Resolve transaction data for router
 */
export function resolveTransaction(route: ActivatedRouteSnapshot): Observable<TransactionResolve> {
    const transactionService = inject(TransactionService);
    const errorService = inject(ErrorService);
    const observable = transactionService.resolve(route.params.transactionId).pipe(last());

    return errorService.redirectIfError(observable);
}

/**
 * From an existing transaction ID resolves bot the duplicated transaction and the duplicated transactionLines
 */
export function resolveDuplicatedTransaction(
    route: ActivatedRouteSnapshot,
): Observable<DuplicatedTransactionResolve | null> {
    const param = route.params.duplicate;
    if (!param) {
        return of(null);
    }

    const transactionService = inject(TransactionService);
    const transactionLineService = inject(TransactionLineService);
    const errorService = inject(ErrorService);

    const variablesManager = new NaturalQueryVariablesManager();
    variablesManager.set('variables', {
        filter: {groups: [{conditions: [{transaction: {equal: {value: param}}}]}]},
        pagination: {pageSize: 999}, // Must fetch everything at once if trying to duplicate
    });

    const observable = forkJoin({
        transaction: transactionService.getOne(param).pipe(
            map(source => {
                return {
                    ...transactionService.getConsolidatedForClient(),
                    name: source.name,
                    transactionDate: null as unknown as string, // Force user to set date
                    remarks: source.remarks,
                    internalRemarks: source.internalRemarks,
                };
            }),
        ),
        transactionLines: transactionLineService.getAll(variablesManager).pipe(
            map(results =>
                results.items.map(source => {
                    return {
                        ...transactionLineService.getConsolidatedForClient(),
                        name: source.name,
                        balance: source.balance,
                        debit: source.debit,
                        credit: source.credit,
                        transactionTag: source.transactionTag,
                        remarks: source.remarks,
                        isReconciled: false,
                    };
                }),
            ),
        ),
    });

    return errorService.redirectIfError(observable);
}
