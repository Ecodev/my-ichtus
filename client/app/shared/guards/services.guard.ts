import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserService} from '../../admin/users/services/user.service';
import {PermissionsService} from '../services/permissions.service';

/**
 * Return if route is allowed or not considering the authenticated user.
 * Used by routing service.
 */
export function canActivateServices(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const router = inject(Router);
    const userService = inject(UserService);
    const permissionsService = inject(PermissionsService);

    return userService.getViewer().pipe(
        map(user => {
            const granted = permissionsService.canAccessServices(user);

            if (!granted) {
                router.navigate(['/profile'], {queryParams: {returnUrl: state.url}});
                return false;
            }

            return true;
        }),
    );
}
