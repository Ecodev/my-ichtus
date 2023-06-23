import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {ExpenseClaimResolve} from '../expenseClaim';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';

/**
 * Resolve expenseClaim data for router
 */
export function resolveExpenseClaimParam(route: ActivatedRouteSnapshot): Observable<ExpenseClaimResolve> {
    const expenseClaimService = inject(ExpenseClaimService);
    const errorService = inject(ErrorService);
    const observable = expenseClaimService.resolve(route.params.expenseClaim).pipe(last());

    return errorService.redirectIfError(observable);
}
