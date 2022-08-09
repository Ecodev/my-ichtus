import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {CurrentUserForProfile} from '../../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class ViewerResolver implements Resolve<{model: CurrentUserForProfile['viewer']}> {
    public constructor(private readonly userService: UserService, private readonly errorService: ErrorService) {}

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<{model: CurrentUserForProfile['viewer']}> {
        const observable = this.userService.resolveViewer().pipe(last());

        return this.errorService.redirectIfError(observable);
    }
}
