import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {TransactionLineResolve} from '../transaction';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionLineService} from './transactionLine.service';

/**
 * Resolve transactionLine data for router
 */
export function resolveTransactionLine(route: ActivatedRouteSnapshot): Observable<TransactionLineResolve> {
    const transactionLineService = inject(TransactionLineService);
    const errorService = inject(ErrorService);
    const observable = transactionLineService.resolve(route.params.transactionLineId).pipe(last());

    return errorService.redirectIfError(observable);
}
