import {inject, Injectable} from '@angular/core';
import {bookableQuery, createBookable, deleteBookables, updateBookable, usageBookablesQuery} from './bookable.queries';
import {
    Bookable,
    BookablesVariables,
    BookableVariables,
    CreateBookable,
    CreateBookableVariables,
    DeleteBookables,
    DeleteBookablesVariables,
    JoinType,
    UpdateBookable,
    UpdateBookableVariables,
    UsageBookables,
    UsageBookablesVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsageBookableService extends NaturalAbstractModelService<
    Bookable['bookable'],
    BookableVariables,
    UsageBookables['bookables'],
    UsageBookablesVariables,
    CreateBookable['createBookable'],
    CreateBookableVariables,
    UpdateBookable['updateBookable'],
    UpdateBookableVariables,
    DeleteBookables,
    DeleteBookablesVariables
> {
    protected readonly bookingService = inject(BookingService);

    public constructor() {
        super('bookable', bookableQuery, usageBookablesQuery, createBookable, updateBookable, deleteBookables);
    }

    public override getPartialVariablesForAll(): Observable<Partial<BookablesVariables>> {
        return of({
            filter: {
                groups: [
                    {
                        joins: {
                            bookings: {type: JoinType.leftJoin},
                        },
                    },
                ],
            },
        });
    }
}
