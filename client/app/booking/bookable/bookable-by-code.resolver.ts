import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {BookableResolve} from '../../admin/bookables/bookable';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {ErrorService} from '../../shared/components/error/error.service';

/**
 * Resolve bookable data for router
 */
export function resolveBookableByCode(route: ActivatedRouteSnapshot): Observable<BookableResolve> {
    const bookableService = inject(BookableService);
    const errorService = inject(ErrorService);
    const observable = bookableService.resolveByCode(route.params.bookableCode).pipe(last());

    return errorService.redirectIfError(observable);
}
