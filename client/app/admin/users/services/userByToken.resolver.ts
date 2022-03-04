import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {UserByTokenResolve} from '../user';

@Injectable({
    providedIn: 'root',
})
export class UserByTokenResolver implements Resolve<UserByTokenResolve> {
    public constructor(private readonly userService: UserService, private readonly errorService: ErrorService) {}

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<UserByTokenResolve> {
        const observable = this.userService.resolveByToken(route.params.token);

        return this.errorService.redirectIfError(observable);
    }
}
