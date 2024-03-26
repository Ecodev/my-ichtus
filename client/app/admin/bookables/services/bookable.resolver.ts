import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookableService} from './bookable.service';

/**
 * Resolve bookable data for router
 */
export function resolveBookable(route: ActivatedRouteSnapshot): ReturnType<BookableService['resolve']> {
    const bookableService = inject(BookableService);
    const errorService = inject(ErrorService);
    const observable = bookableService.resolve(route.params.bookableId).pipe(last());

    return errorService.redirectIfError(observable);
}
