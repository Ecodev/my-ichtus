import {inject} from '@angular/core';
import {last, type Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '@ecodev/natural';
import {type CurrentUserForProfileQuery} from '../../../shared/generated-types';

export function resolveViewer(): Observable<CurrentUserForProfileQuery['viewer']> {
    const userService = inject(UserService);
    const errorService = inject(ErrorService);
    const observable = userService.getViewer().pipe(last());

    return errorService.redirectIfError(observable);
}
