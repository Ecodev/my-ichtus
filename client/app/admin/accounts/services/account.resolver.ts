import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {AccountResolve} from '../account';
import {ErrorService} from '../../../shared/components/error/error.service';
import {AccountService} from './account.service';

/**
 * Resolve account data for router
 */
export function resolveAccount(route: ActivatedRouteSnapshot): Observable<AccountResolve> {
    const accountService = inject(AccountService);
    const errorService = inject(ErrorService);
    const observable = accountService.resolve(route.params.accountId).pipe(last());

    return errorService.redirectIfError(observable);
}
