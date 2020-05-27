import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {TransactionResolve} from '../transaction';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionService} from './transaction.service';

@Injectable({
    providedIn: 'root',
})
export class TransactionResolver implements Resolve<TransactionResolve> {
    constructor(private transactionService: TransactionService, private errorService: ErrorService) {}

    /**
     * Resolve transaction data for router and panels service
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<TransactionResolve> {
        const observable = this.transactionService.resolve(route.params.transactionId);

        return this.errorService.redirectIfError(observable);
    }
}
