import {inject} from '@angular/core';
import {type ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, last, map, type Observable, of} from 'rxjs';
import {type DuplicatedTransactionResolve} from '../transaction';
import {ErrorService, ignoreErrors} from '@ecodev/natural';
import {TransactionService} from './transaction.service';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {TransactionLineService} from './transactionLine.service';
import {Apollo} from 'apollo-angular';
import {type LastClosingDateQuery, type LastClosingDateQueryVariables} from '../../../shared/generated-types';
import {lastClosingDateQuery} from './transaction.queries';

/**
 * Resolve transaction data for router
 */
export function resolveTransaction(route: ActivatedRouteSnapshot): ReturnType<TransactionService['resolve']> {
    const transactionService = inject(TransactionService);
    const errorService = inject(ErrorService);
    const observable = transactionService.resolve(route.params.transactionId).pipe(last());

    return errorService.redirectIfError(observable);
}

/**
 * From an existing transaction ID resolves both the duplicated transaction and the duplicated transactionLines
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
                    ...transactionService.getDefaultForServer(),
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
                        ...transactionLineService.getDefaultForServer(),
                        transactionDate: null as unknown as string, // Force user to set date
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

/**
 * Resolve the last accounting closing date, if any
 */
export function resolveLastClosingDate(): Observable<LastClosingDateQuery['lastClosingDate']> {
    const apollo = inject(Apollo);
    const errorService = inject(ErrorService);

    const observable = apollo
        .query<LastClosingDateQuery, LastClosingDateQueryVariables>({
            query: lastClosingDateQuery,
            fetchPolicy: 'network-only',
        })
        .pipe(
            ignoreErrors(),
            map(result => result.data.lastClosingDate),
        );

    return errorService.redirectIfError(observable);
}
