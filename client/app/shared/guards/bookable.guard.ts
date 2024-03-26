import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserService} from '../../admin/users/services/user.service';
import {PermissionsService} from '../services/permissions.service';

/**
 * Return if route is allowed or not considering the authenticated user.
 * Used by routing service.
 */
export function canActivateBookable(): Observable<boolean> {
    const router = inject(Router);
    const userService = inject(UserService);
    const permissionsService = inject(PermissionsService);

    return userService.getViewer().pipe(
        map(user => {
            const granted = permissionsService.canAccessBookable(user);

            if (!granted) {
                router.navigate(['/']);
                return false;
            }

            return true;
        }),
    );
}
