import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {BookingService} from './booking.service';
import {NaturalEnumService} from '@ecodev/natural';

/**
 * Resolve booking data for router
 */
function resolveBooking(route: ActivatedRouteSnapshot): ReturnType<BookingService['resolve']> {
    const bookingService = inject(BookingService);
    const errorService = inject(ErrorService);
    const observable = bookingService.resolve(route.params.bookingId).pipe(last());

    return errorService.redirectIfError(observable);
}

export const bookingResolvers = {
    model: resolveBooking,
    status: () => inject(NaturalEnumService).get('BookingStatus'),
} as const;
