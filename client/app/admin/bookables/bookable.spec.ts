import {BookableUsage} from '../../shared/generated-types';
import {availabilityStatus, AvailabilityStatus, availabilityText, usageStatus, usageText} from './bookable';

describe('availabilityText', () => {
    const cases: [number, number, number, number, AvailabilityStatus, string][] = [
        [7, 0, 5, 0, 'available', '2 places'],
        [7, 3, 5, 0, 'available', '2 places'],
        [7, 3, 5, 1, 'available', '1 place'],
        [7, 3, 5, 2, 'waitingList', "File d'attente"],
        [7, 3, 5, 3, 'waitingList', "File d'attente"],
        [7, 3, 6, 0, 'available', '1 place'],
        [7, 3, 6, 1, 'waitingList', "File d'attente"],
        [7, 3, 6, 2, 'waitingList', "File d'attente"],
        [7, 3, 6, 3, 'waitingList', "File d'attente"],
        [7, 3, 7, 0, 'waitingList', "File d'attente"],
        [7, 3, 7, 1, 'waitingList', "File d'attente"],
        [7, 3, 7, 2, 'waitingList', "File d'attente"],
        [7, 3, 7, 3, 'full', 'Complet'],
    ];

    cases.forEach(values => {
        it(values.join(', '), () => {
            const bookable: BookableUsage = {
                __typename: 'Bookable',
                id: '123',
                simultaneousBookingMaximum: values[0],
                waitingListLength: values[1],
                simultaneousBookings: Array(values[2]).fill({id: 1}),
                simultaneousApplications: Array(values[3]).fill({id: 1}),
            };

            expect(availabilityStatus(bookable)).toBe(values[4]);
            expect(availabilityText(bookable)).toBe(values[5]);
        });
    });
});

describe('usageText', () => {
    const cases: [number, number, number, number, AvailabilityStatus, string][] = [
        [7, 0, 5, 0, 'available', '5 / 7'],
        [7, 3, 5, 0, 'available', '5 / 7'],
        [7, 3, 5, 1, 'available', '5 + 1 / 7'],
        [7, 3, 5, 2, 'available', '5 + 2 / 7'],
        [7, 3, 5, 3, 'waitingList', '5 + 3 / 7'],
        [7, 3, 6, 0, 'available', '6 / 7'],
        [7, 3, 6, 1, 'available', '6 + 1 / 7'],
        [7, 3, 6, 2, 'waitingList', '6 + 2 / 7'],
        [7, 3, 6, 3, 'waitingList', '6 + 3 / 7'],
        [7, 3, 7, 0, 'full', 'Complet'],
        [7, 3, 7, 1, 'full', 'Complet + 1'],
        [7, 3, 7, 2, 'full', 'Complet + 2'],
        [7, 3, 7, 3, 'full', 'Complet + 3'],
        [3, 0, 0, 3, 'available', '0 + 3 / 3'],
        [-1, 0, 2, 3, 'unlimited', '2 + 3'],
    ];

    cases.forEach(values => {
        it(values.join(', '), () => {
            const bookable: BookableUsage = {
                __typename: 'Bookable',
                id: '123',
                simultaneousBookingMaximum: values[0],
                waitingListLength: values[1],
                simultaneousBookings: Array(values[2]).fill({id: 1}),
                simultaneousApplications: Array(values[3]).fill({id: 1}),
            };

            expect(usageStatus(bookable)).toBe(values[4]);
            expect(usageText(bookable)).toBe(values[5]);
        });
    });
});
