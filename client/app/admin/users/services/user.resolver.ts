import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';

export function resolveUser(route: ActivatedRouteSnapshot): ReturnType<UserService['resolve']> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.resolve(route.params.userId).pipe(last());

    return errorService.redirectIfError(observable);
}
