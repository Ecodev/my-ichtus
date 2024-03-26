import {BookableUsage} from '../../shared/generated-types';

export type AvailabilityStatus = 'unlimited' | 'available' | 'waitingList' | 'full';

export function availabilityStatus(bookable: BookableUsage): AvailabilityStatus {
    const totalCount = bookable.simultaneousBookings.length + bookable.simultaneousApplications.length;

    if (bookable.simultaneousBookingMaximum < 0) {
        return 'unlimited';
    } else if (totalCount >= bookable.simultaneousBookingMaximum + bookable.waitingListLength) {
        return `full`;
    } else if (bookable.waitingListLength && totalCount >= bookable.simultaneousBookingMaximum) {
        return `waitingList`;
    } else {
        return `available`;
    }
}

export function availabilityText(bookable: BookableUsage): string {
    switch (availabilityStatus(bookable)) {
        case 'unlimited':
            return 'Disponible';
        case 'available': {
            const totalCount = bookable.simultaneousBookings.length + bookable.simultaneousApplications.length;
            const freeSpot = bookable.simultaneousBookingMaximum - totalCount;

            return freeSpot === 1 ? `1 place` : `${freeSpot} places`;
        }
        case 'waitingList':
            return `File d'attente`;
        case 'full':
            return `Complet`;
    }
}

export function usageStatus(bookable: BookableUsage | null): AvailabilityStatus {
    if (!bookable) {
        return 'unlimited';
    }

    const totalCount = bookable.simultaneousBookings.length + bookable.simultaneousApplications.length;

    if (bookable.simultaneousBookingMaximum < 0) {
        return 'unlimited';
    } else if (bookable.simultaneousBookings.length >= bookable.simultaneousBookingMaximum) {
        return `full`;
    } else if (totalCount <= bookable.simultaneousBookingMaximum) {
        return `available`;
    } else if (
        bookable.waitingListLength &&
        totalCount < bookable.simultaneousBookingMaximum + bookable.waitingListLength
    ) {
        return `waitingList`;
    } else {
        return `available`;
    }
}

export function usageText(bookable: BookableUsage | null): string {
    if (!bookable) {
        return '';
    }

    const waiting = bookable.simultaneousApplications.length ? ` + ${bookable.simultaneousApplications.length}` : '';

    switch (usageStatus(bookable)) {
        case 'unlimited':
            return `${bookable.simultaneousBookings.length}${waiting}`;
        case 'available':
        case 'waitingList':
            return `${bookable.simultaneousBookings.length}${waiting} / ${bookable.simultaneousBookingMaximum}`;
        case 'full':
            return `Complet${waiting}`;
    }
}
