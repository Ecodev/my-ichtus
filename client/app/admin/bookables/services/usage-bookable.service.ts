import {inject, Injectable} from '@angular/core';
import {bookableQuery, createBookable, deleteBookables, updateBookable, usageBookablesQuery} from './bookable.queries';
import {
    BookableQuery,
    BookablesQueryVariables,
    BookableQueryVariables,
    CreateBookable,
    CreateBookableVariables,
    DeleteBookables,
    DeleteBookablesVariables,
    JoinType,
    UpdateBookable,
    UpdateBookableVariables,
    UsageBookablesQuery,
    UsageBookablesQueryVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsageBookableService extends NaturalAbstractModelService<
    BookableQuery['bookable'],
    BookableQueryVariables,
    UsageBookablesQuery['bookables'],
    UsageBookablesQueryVariables,
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

    public override getPartialVariablesForAll(): Observable<Partial<BookablesQueryVariables>> {
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
