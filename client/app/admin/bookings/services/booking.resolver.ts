import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {last, Observable} from 'rxjs';
import {BookingResolve} from '../booking';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookingService} from './booking.service';

@Injectable({
    providedIn: 'root',
})
export class BookingResolver implements Resolve<BookingResolve> {
    public constructor(private readonly bookingService: BookingService, private readonly errorService: ErrorService) {}

    /**
     * Resolve booking data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<BookingResolve> {
        const observable = this.bookingService.resolve(route.params.bookingId).pipe(last());

        return this.errorService.redirectIfError(observable);
    }
}
