import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {last, Observable} from 'rxjs';
import {ExpenseClaimResolve} from '../expenseClaim';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimParamResolver implements Resolve<ExpenseClaimResolve> {
    public constructor(
        private readonly expenseClaimService: ExpenseClaimService,
        private readonly errorService: ErrorService,
    ) {}

    /**
     * Resolve expenseClaim data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<ExpenseClaimResolve> {
        const observable = this.expenseClaimService.resolve(route.params.expenseClaim).pipe(last());

        return this.errorService.redirectIfError(observable);
    }
}
