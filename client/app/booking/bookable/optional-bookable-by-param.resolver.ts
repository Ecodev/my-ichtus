import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable, of} from 'rxjs';
import {BookableResolve} from '../../admin/bookables/bookable';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {ErrorService} from '../../shared/components/error/error.service';

/**
 * Resolve bookable data from route param
 */
export function resolveOptionalBookableByParam(route: ActivatedRouteSnapshot): Observable<BookableResolve | null> {
    const bookableService = inject(BookableService);
    const errorService = inject(ErrorService);
    const bookable = route.params.bookable;
    if (bookable) {
        const observable = bookableService.resolve(bookable).pipe(last());

        return errorService.redirectIfError(observable);
    }

    return of(null);
}
