import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {BookingResolve} from '../booking';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookingService} from './booking.service';

/**
 * Resolve booking data for router
 */
export function resolveBooking(route: ActivatedRouteSnapshot): Observable<BookingResolve> {
    const bookingService = inject(BookingService);
    const errorService = inject(ErrorService);
    const observable = bookingService.resolve(route.params.bookingId).pipe(last());

    return errorService.redirectIfError(observable);
}
