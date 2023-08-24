import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {UserByTokenResolve} from '../user';

export function resolveUserByToken(route: ActivatedRouteSnapshot): Observable<UserByTokenResolve> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.resolveByToken(route.params.token).pipe(last());

    return errorService.redirectIfError(observable);
}
