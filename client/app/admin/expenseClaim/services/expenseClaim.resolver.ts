import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';

/**
 * Resolve expenseClaim data for router
 */
export function resolveExpenseClaim(route: ActivatedRouteSnapshot): ReturnType<ExpenseClaimService['resolve']> {
    const expenseClaimService = inject(ExpenseClaimService);
    const errorService = inject(ErrorService);
    const observable = expenseClaimService.resolve(route.params.expenseClaimId).pipe(last());

    return errorService.redirectIfError(observable);
}
