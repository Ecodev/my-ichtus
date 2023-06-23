import {inject} from '@angular/core';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {CurrentUserForProfile} from '../../../shared/generated-types';

export type ViewerResolve = {model: CurrentUserForProfile['viewer']};

/**
 * Resolve sites for routing service only at the moment
 */
export function resolveViewer(): Observable<ViewerResolve> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.resolveViewer().pipe(last());

    return errorService.redirectIfError(observable);
}
