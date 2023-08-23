import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionTagService} from './transactionTag.service';
import {inject} from '@angular/core';

/**
 * Resolve transactionTag data for router
 */
export function resolveTransactionTag(route: ActivatedRouteSnapshot): ReturnType<TransactionTagService['resolve']> {
    const transactionTagService = inject(TransactionTagService);
    const errorService = inject(ErrorService);
    const observable = transactionTagService.resolve(route.params.transactionTagId).pipe(last());

    return errorService.redirectIfError(observable);
}
