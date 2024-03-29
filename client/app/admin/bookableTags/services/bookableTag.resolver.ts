import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookableTagService} from './bookableTag.service';

/**
 * Resolve bookableTag data for router
 */
export function resolveBookableTag(route: ActivatedRouteSnapshot): ReturnType<BookableTagService['resolve']> {
    const bookableTagService = inject(BookableTagService);
    const errorService = inject(ErrorService);
    const observable = bookableTagService.resolve(route.params.bookableTagId).pipe(last());

    return errorService.redirectIfError(observable);
}
