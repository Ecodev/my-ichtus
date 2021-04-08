import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {UserService} from '../../admin/users/services/user.service';

@Injectable({
    providedIn: 'root',
})
export class DoorGuard implements CanActivate {
    constructor(private readonly router: Router, private readonly userService: UserService) {}

    /**
     * Return if route is allowed or not considering the authenticated user.
     * Used by routing service.
     */
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.userService.resolveViewer().pipe(
            map(user => {
                const granted = UserService.canAccessDoor(user.model);

                if (!granted) {
                    this.router.navigate(['/']);
                    return false;
                }

                return true;
            }),
        );
    }
}
