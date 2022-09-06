import {Apollo, gql} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {bookableMetaFragment} from '../admin/bookables/services/bookable.queries';
import {NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';
import {SafetyBookings_bookings, SafetyBookingsVariables} from '../shared/generated-types';

const safetyBookings = gql`
    query SafetyBookings($filter: BookingFilter, $sorting: [BookingSorting!], $pagination: PaginationInput) {
        bookings(filter: $filter, sorting: $sorting, pagination: $pagination) {
            items {
                id
                destination
                startComment
                startDate
                endComment
                endDate
                estimatedEndDate
                creationDate
                updateDate
                participantCount
                status
                bookable {
                    id
                    name
                    image {
                        id
                    }
                    ...BookableMeta
                }
            }
            pageSize
            pageIndex
            length
            totalParticipantCount
            totalInitialPrice
            totalPeriodicPrice
        }
    }
    ${bookableMetaFragment}
`;

@Injectable({
    providedIn: 'root',
})
export class SafetyBookingService extends NaturalAbstractModelService<
    never,
    never,
    SafetyBookings_bookings,
    SafetyBookingsVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'booking', null, safetyBookings, null, null, null);
    }
}
