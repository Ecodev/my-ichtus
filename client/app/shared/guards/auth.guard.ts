import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserService} from '../../admin/users/services/user.service';

/**
 * Return if route is allowed or not considering the authenticated user.
 * Used by routing service.
 */
export function canActivateAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const router = inject(Router);
    const userService = inject(UserService);

    return userService.resolveViewer().pipe(
        map(user => {
            if (!user.model) {
                router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
                return false;
            }

            return true;
        }),
    );
}
