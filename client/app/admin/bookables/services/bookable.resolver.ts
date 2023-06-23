import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {BookableResolve} from '../bookable';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookableService} from './bookable.service';

/**
 * Resolve bookable data for router
 */
export function resolveBookable(route: ActivatedRouteSnapshot): Observable<BookableResolve> {
    const bookableService = inject(BookableService);
    const errorService = inject(ErrorService);
    const observable = bookableService.resolve(route.params.bookableId).pipe(last());

    return errorService.redirectIfError(observable);
}
