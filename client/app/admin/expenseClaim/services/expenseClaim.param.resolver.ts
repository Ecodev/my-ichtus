import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';
import {ExpenseClaimQuery} from '../../../shared/generated-types';

/**
 * Resolve expenseClaim data for router
 */
export function resolveExpenseClaimParam(
    route: ActivatedRouteSnapshot,
): Observable<ExpenseClaimQuery['expenseClaim'] | null> {
    const expenseClaimService = inject(ExpenseClaimService);
    const errorService = inject(ErrorService);
    const param = route.params.expenseClaim;
    const observable = param ? expenseClaimService.getOne(param) : of(null);

    return errorService.redirectIfError(observable);
}
