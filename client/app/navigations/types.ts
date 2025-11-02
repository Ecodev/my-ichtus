import type {Bookables, Bookings, Users} from '../shared/generated-types';
import {UserForVanillaService} from './user-for-vanilla.service';
import {BookableForVanillaService} from './bookable-for-vanilla.service';
import {BookingForVanillaService} from './booking-for-vanilla.service';

// Type alias for convenience
export type User = Users['users']['items'][0];
export type Bookable = Bookables['bookables']['items'][0];
export type Booking = Bookings['bookings']['items'][0];

export type PopBookingWhich = 'confirmation' | 'infos' | 'finish';

export type ActualizePopBooking = Booking & {
    ids: string[];
    bookables: (Bookable & {available?: boolean | undefined; lastBooking: Booking})[];
};

export type MergedBooking = Booking & {
    bookables?: Booking['bookable'][];
    ids?: string[];
};

export type BookableWithLastBooking = Bookable & {
    lastBooking: null | Booking;
};

export type BookableWithExtra = Bookable & {
    used: boolean;
    lastBooking: null | Booking;
    lessThan13Minutes?: boolean;
};

export type ServerType = {
    userService: UserForVanillaService;
    bookableService: BookableForVanillaService;
    bookingService: BookingForVanillaService;
};
