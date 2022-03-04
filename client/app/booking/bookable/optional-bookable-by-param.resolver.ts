import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable, of} from 'rxjs';
import {BookableResolve} from '../../admin/bookables/bookable';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {ErrorService} from '../../shared/components/error/error.service';

@Injectable({
    providedIn: 'root',
})
export class OptionalBookableByParamResolver implements Resolve<BookableResolve | null> {
    public constructor(
        private readonly bookableService: BookableService,
        private readonly errorService: ErrorService,
    ) {}

    /**
     * Resolve bookable data from route param
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookableResolve | null> {
        const bookable = route.params.bookable;
        if (bookable) {
            const observable = this.bookableService.resolve(bookable);

            return this.errorService.redirectIfError(observable);
        }

        return of(null);
    }
}
