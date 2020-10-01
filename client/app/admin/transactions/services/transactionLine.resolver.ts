import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {TransactionLineResolve} from '../transaction';
import {ErrorService} from '../../../shared/components/error/error.service';
import {TransactionLineService} from './transactionLine.service';

@Injectable({
    providedIn: 'root',
})
export class TransactionLineResolver implements Resolve<TransactionLineResolve> {
    constructor(private transactionLineService: TransactionLineService, private errorService: ErrorService) {}

    /**
     * Resolve transactionLine data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<TransactionLineResolve> {
        const observable = this.transactionLineService.resolve(route.params.transactionLineId);

        return this.errorService.redirectIfError(observable);
    }
}
