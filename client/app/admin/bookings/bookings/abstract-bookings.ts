import {Directive, Input} from '@angular/core';
import {AvailableColumn, Button, NaturalAbstractList} from '@ecodev/natural';
import {BookingService} from '../services/booking.service';
import {BookingWithOwnerService} from '../services/booking-with-owner.service';
import {SafetyBookingService} from '../../../safety/safety-booking.service';
import {usageStatus as usageStatusFunc, usageText} from '../../bookables/bookable';

const edit: AvailableColumn = {id: 'edit', label: 'Editer'} as const;
const owner: AvailableColumn = {id: 'owner', label: 'Utilisateur'};
const ownerReadonly: AvailableColumn = {id: 'ownerReadonly', label: 'Utilisateur'};
const status: AvailableColumn = {id: 'status', label: 'Statut'};
const ownerBalance: AvailableColumn = {id: 'ownerBalance', label: 'Solde'};
const ownerCreationDate: AvailableColumn = {id: 'ownerCreationDate', label: 'Membre depuis'};
const bookable: AvailableColumn = {id: 'bookable', label: 'Item'};
const destination: AvailableColumn = {id: 'destination', label: 'Destination'};
const startDate: AvailableColumn = {id: 'startDate', label: 'Début'};
const startComment: AvailableColumn = {id: 'startComment', label: 'Note de début'};
const endDate: AvailableColumn = {id: 'endDate', label: 'Fin'};
const estimatedEndDate: AvailableColumn = {id: 'estimatedEndDate', label: 'Retour prévu'};
const participantCount: AvailableColumn = {id: 'participantCount', label: 'Nb participants'};
const endComment: AvailableColumn = {id: 'endComment', label: 'Note de fin'};
const terminateBooking: AvailableColumn = {id: 'terminateBooking', label: 'Terminer'};
const email: AvailableColumn = {id: 'email', label: 'Email'};
const mobilePhone: AvailableColumn = {id: 'mobilePhone', label: 'Tél.'};
const usageStatus: AvailableColumn = {id: 'usageStatus', label: 'Inscriptions'};

const allAvailableColumns = [
    edit,
    owner,
    ownerReadonly,
    status,
    ownerBalance,
    ownerCreationDate,
    bookable,
    destination,
    startDate,
    startComment,
    endDate,
    estimatedEndDate,
    participantCount,
    endComment,
    terminateBooking,
    email,
    mobilePhone,
];

export const availableColumnsForSafety = [
    bookable,
    destination,
    startDate,
    startComment,
    estimatedEndDate,
    participantCount,
    endComment,
];

export const availableColumnsForBookingsLive = [
    edit,
    owner,
    bookable,
    destination,
    startDate,
    startComment,
    estimatedEndDate,
    participantCount,
    terminateBooking,
];

export const availableColumnsForBookingsBooking = [
    edit,
    owner,
    status,
    bookable,
    startDate,
    startComment,
    endDate,
    estimatedEndDate,
    participantCount,
    endComment,
    terminateBooking,
];

export const availableColumnsForBookingsSelfApproved = [
    edit,
    owner,
    bookable,
    destination,
    startDate,
    startComment,
    endDate,
    estimatedEndDate,
    participantCount,
    endComment,
];

export const availableColumnsForBookingsStorageApplication = [edit, owner, bookable, startDate, endDate, endComment];

export const availableColumnsForBookingsWithOwnerApplications = [
    edit,
    owner,
    ownerBalance,
    ownerCreationDate,
    bookable,
    startDate,
    usageStatus,
];

export const availableColumnsForBookingsWithOwnerWithoutTrainers = [
    edit,
    owner,
    ownerBalance,
    ownerCreationDate,
    startDate,
    endDate,
    email,
    mobilePhone,
];

export const availableColumnsForBookingsWithOwnerOnlyTrainers = [
    ownerReadonly,
    ownerCreationDate,
    startDate,
    endDate,
    email,
    mobilePhone,
];

export const availableColumnsForBookingsServicesApplication = [edit, owner, bookable, startDate];

@Directive({standalone: true})
export abstract class AbstractBookings<
    TService extends BookingService | BookingWithOwnerService | SafetyBookingService,
> extends NaturalAbstractList<TService> {
    public override availableColumns = allAvailableColumns;
    @Input() public showFabButton = true;

    public readonly buttons: Button[] | null = null;
    public readonly usageStatus = usageStatusFunc;
    public readonly usageText = usageText;

    public maybeTerminateBooking(id: string): void {
        if (!(this.service instanceof BookingService)) {
            throw new Error('Cannot terminate a booking with this service');
        }

        this.service.terminateBooking(id);
    }
}
