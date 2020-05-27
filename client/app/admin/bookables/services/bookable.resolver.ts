import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {BookableResolve} from '../bookable';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookableService} from './bookable.service';

@Injectable({
    providedIn: 'root',
})
export class BookableResolver implements Resolve<BookableResolve> {
    constructor(private bookableService: BookableService, private errorService: ErrorService) {}

    /**
     * Resolve bookable data for router and panels service
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookableResolve> {
        const observable = this.bookableService.resolve(route.params.bookableId);

        return this.errorService.redirectIfError(observable);
    }
}
