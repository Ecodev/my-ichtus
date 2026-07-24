import {inject, Injectable} from '@angular/core';
import {bookableQuery, createBookable, deleteBookables, updateBookable, usageBookablesQuery} from './bookable.queries';
import {
    type BookableQuery,
    type BookableQueryVariables,
    type BookablesQueryVariables,
    type CreateBookable,
    type CreateBookableVariables,
    type DeleteBookables,
    type DeleteBookablesVariables,
    JoinType,
    type UpdateBookable,
    type UpdateBookableVariables,
    type UsageBookablesQuery,
    type UsageBookablesQueryVariables,
} from '../../../shared/generated-types';
import {BookingService} from '../../bookings/services/booking.service';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {type Observable, of} from 'rxjs';

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
