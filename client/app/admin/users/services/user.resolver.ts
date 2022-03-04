import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {UserResolve} from '../user';

@Injectable({
    providedIn: 'root',
})
export class UserResolver implements Resolve<UserResolve> {
    public constructor(private readonly userService: UserService, private readonly errorService: ErrorService) {}

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<UserResolve> {
        const observable = this.userService.resolve(route.params.userId);

        return this.errorService.redirectIfError(observable);
    }
}
