import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {AccountResolve} from '../account';
import {ErrorService} from '../../../shared/components/error/error.service';
import {AccountService} from './account.service';

@Injectable({
    providedIn: 'root',
})
export class AccountResolver implements Resolve<AccountResolve> {
    public constructor(private readonly accountService: AccountService, private readonly errorService: ErrorService) {}

    /**
     * Resolve account data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<AccountResolve> {
        const observable = this.accountService.resolve(route.params.accountId);

        return this.errorService.redirectIfError(observable);
    }
}
