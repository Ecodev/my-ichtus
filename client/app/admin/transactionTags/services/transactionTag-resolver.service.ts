import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionTagService} from './transactionTag.service';
import {TransactionTagResolve} from '../transactionTag';

@Injectable({
    providedIn: 'root',
})
export class TransactionTagResolver implements Resolve<TransactionTagResolve> {
    constructor(
        private readonly transactionTagService: TransactionTagService,
        private readonly errorService: ErrorService,
    ) {}

    /**
     * Resolve transactionTag data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<TransactionTagResolve> {
        const observable = this.transactionTagService.resolve(route.params.transactionTagId);

        return this.errorService.redirectIfError(observable);
    }
}
