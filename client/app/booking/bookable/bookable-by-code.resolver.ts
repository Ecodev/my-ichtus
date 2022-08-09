import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {last, Observable} from 'rxjs';
import {BookableResolve} from '../../admin/bookables/bookable';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {ErrorService} from '../../shared/components/error/error.service';

@Injectable({
    providedIn: 'root',
})
export class BookableByCodeResolver implements Resolve<BookableResolve> {
    public constructor(
        private readonly bookableService: BookableService,
        private readonly errorService: ErrorService,
    ) {}

    /**
     * Resolve bookable data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookableResolve> {
        const observable = this.bookableService.resolveByCode(route.params.bookableCode).pipe(last());

        return this.errorService.redirectIfError(observable);
    }
}
