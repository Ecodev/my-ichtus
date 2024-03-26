import {inject} from '@angular/core';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {CurrentUserForProfile} from '../../../shared/generated-types';

export function resolveViewer(): Observable<CurrentUserForProfile['viewer']> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.getViewer().pipe(last());

    return errorService.redirectIfError(observable);
}
