import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {last, Observable} from 'rxjs';
import {UserService} from './user.service';
import {ErrorService} from '../../../shared/components/error/error.service';
import {CurrentUserForProfile} from '../../../shared/generated-types';

export type ViewerResolve = {model: CurrentUserForProfile['viewer']};

@Injectable({
    providedIn: 'root',
})
export class ViewerResolver implements Resolve<ViewerResolve> {
    public constructor(private readonly userService: UserService, private readonly errorService: ErrorService) {}

    /**
     * Resolve sites for routing service only at the moment
     */
    public resolve(): Observable<ViewerResolve> {
        const observable = this.userService.resolveViewer().pipe(last());

        return this.errorService.redirectIfError(observable);
    }
}
