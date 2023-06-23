import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {UserResolve} from '../user';

/**
 * Resolve sites for routing service only at the moment
 */
export function resolveUser(route: ActivatedRouteSnapshot): Observable<UserResolve> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.resolve(route.params.userId).pipe(last());

    return errorService.redirectIfError(observable);
}
