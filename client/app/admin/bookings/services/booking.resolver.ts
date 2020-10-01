import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {BookingResolve} from '../booking';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookingService} from './booking.service';

@Injectable({
    providedIn: 'root',
})
export class BookingResolver implements Resolve<BookingResolve> {
    constructor(private bookingService: BookingService, private errorService: ErrorService) {}

    /**
     * Resolve booking data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookingResolve> {
        const observable = this.bookingService.resolve(route.params.bookingId);

        return this.errorService.redirectIfError(observable);
    }
}
