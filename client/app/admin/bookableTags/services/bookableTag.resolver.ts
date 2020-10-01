import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookableTagService} from './bookableTag.service';
import {BookableTagResolve} from '../bookableTag';

@Injectable({
    providedIn: 'root',
})
export class BookableTagResolver implements Resolve<BookableTagResolve> {
    constructor(private bookableTagService: BookableTagService, private errorService: ErrorService) {}

    /**
     * Resolve bookableTag data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookableTagResolve> {
        const observable = this.bookableTagService.resolve(route.params.bookableTagId);

        return this.errorService.redirectIfError(observable);
    }
}
