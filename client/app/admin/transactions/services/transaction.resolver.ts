import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {TransactionResolve} from '../transaction';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionService} from './transaction.service';

/**
 * Resolve transaction data for router
 */
export function resolveTransaction(route: ActivatedRouteSnapshot): Observable<TransactionResolve> {
    const transactionService = inject(TransactionService);
    const errorService = inject(ErrorService);
    const observable = transactionService.resolve(route.params.transactionId).pipe(last());

    return errorService.redirectIfError(observable);
}
