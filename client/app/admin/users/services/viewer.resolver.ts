import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {CurrentUserForProfile} from '../../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class ViewerResolver implements Resolve<{model: CurrentUserForProfile['viewer']}> {
    constructor(private userService: UserService, private errorService: ErrorService) {}

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<{model: CurrentUserForProfile['viewer']}> {
        const observable = this.userService.resolveViewer();

        return this.errorService.redirectIfError(observable);
    }
}
