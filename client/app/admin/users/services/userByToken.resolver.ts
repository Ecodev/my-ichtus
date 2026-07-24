import {inject} from '@angular/core';
import {type ActivatedRouteSnapshot} from '@angular/router';
import {last, type Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '@ecodev/natural';
import {type UserByTokenResolve} from '../user';

export function resolveUserByToken(route: ActivatedRouteSnapshot): Observable<UserByTokenResolve> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.resolveByToken(route.params.token).pipe(last());

    return errorService.redirectIfError(observable);
}
