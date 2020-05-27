import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {ExpenseClaimResolve} from '../expenseClaim';
import {ErrorService} from '../../../shared/components/error/error.service';
import {ExpenseClaimService} from './expenseClaim.service';

@Injectable({
    providedIn: 'root',
})
export class ExpenseClaimParamResolver implements Resolve<ExpenseClaimResolve> {
    constructor(private expenseClaimService: ExpenseClaimService, private errorService: ErrorService) {}

    /**
     * Resolve expenseClaim data for router and panels service
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<ExpenseClaimResolve> {
        const observable = this.expenseClaimService.resolve(route.params.expenseClaim);

        return this.errorService.redirectIfError(observable);
    }
}
