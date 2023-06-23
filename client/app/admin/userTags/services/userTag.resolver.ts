import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {UserTagService} from './userTag.service';
import {UserTagResolve} from '../userTag';

/**
 * Resolve userTag data for router
 */
export function resolveUserTag(route: ActivatedRouteSnapshot): Observable<UserTagResolve> {
    const userTagService = inject(UserTagService);
    const errorService = inject(ErrorService);
    const observable = userTagService.resolve(route.params.userTagId).pipe(last());

    return errorService.redirectIfError(observable);
}
