import {inject} from '@angular/core';
import {type ActivatedRouteSnapshot} from '@angular/router';
import {last, type Observable, of} from 'rxjs';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {ErrorService} from '@ecodev/natural';

/**
 * Resolve bookable data from route param
 */
export function resolveOptionalBookableByParam(
    route: ActivatedRouteSnapshot,
): ReturnType<BookableService['resolve']> | Observable<null> {
    const bookableService = inject(BookableService);
    const errorService = inject(ErrorService);
    const bookable = route.params.bookable;
    if (bookable) {
        const observable = bookableService.resolve(bookable).pipe(last());

        return errorService.redirectIfError(observable);
    }

    return of(null);
}
