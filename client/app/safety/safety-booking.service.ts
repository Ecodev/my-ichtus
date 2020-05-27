import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {BookingService} from '../admin/bookings/services/booking.service';
import gql from 'graphql-tag';
import {bookableMetaFragment} from '../admin/bookables/services/bookable.queries';
import {NaturalEnumService} from '@ecodev/natural';

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
                    ...bookableMeta
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
export class SafetyBookingService extends BookingService {
    constructor(apollo: Apollo, enumService: NaturalEnumService) {
        super(apollo, enumService);
        this.allQuery = safetyBookings;
    }
}
