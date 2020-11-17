import {Component, Injector, OnInit} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {
    BookableSortingField,
    BookablesVariables,
    Booking,
    BookingPartialInput,
    BookingStatus,
    BookingType,
    BookingVariables,
    CreateBooking,
    CreateBookingVariables,
    DeleteBookings,
    DeleteBookingsVariables,
    SortingOrder,
    UpdateBooking,
    UpdateBookingVariables,
} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {UsageBookableService} from '../../bookables/services/usage-bookable.service';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
})
export class BookingComponent
    extends NaturalAbstractDetail<
        Booking['booking'],
        BookingVariables,
        CreateBooking['createBooking'],
        CreateBookingVariables,
        UpdateBooking['updateBooking'],
        UpdateBookingVariables,
        DeleteBookings,
        DeleteBookingsVariables
    >
    implements OnInit {
    public UsageBookableService = UsageBookableService;
    public BookingStatus = BookingStatus;
    public suggestionVariables;

    /**
     * Received the created booking after having processing an application
     */
    public newBooking;

    constructor(
        public bookingService: BookingService,
        injector: Injector,
        public bookableService: BookableService,
        public userService: UserService,
    ) {
        super('booking', bookingService, injector);
    }

    public ngOnInit(): void {
        super.ngOnInit();

        const tags = this.form.get('bookable')?.value.bookableTags;
        if (tags.find(t => t.id === BookableTagService.STORAGE)) {
            this.suggestionVariables = this.getBookablesVariables([BookableTagService.STORAGE]);
        } else if (tags.find(t => t.id === BookableTagService.FORMATION)) {
            this.suggestionVariables = this.getBookablesVariables([BookableTagService.FORMATION]);
        } else if (tags.find(t => t.id === BookableTagService.WELCOME)) {
            this.suggestionVariables = this.getBookablesVariables([BookableTagService.WELCOME]);
        }
    }

    public endBooking(): void {
        this.bookingService.terminateBooking(this.data.model.id).subscribe(() => {
            const endDate = this.form.get('endDate');
            if (endDate) {
                endDate.setValue(new Date().toISOString());
            }
        });
    }

    public isSelfApproved(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value ? bookable.value.bookingType === BookingType.self_approved : false;
        }

        return false;
    }

    public isApplication(): boolean {
        const status = this.form.get('status');
        if (status && status.value !== BookingStatus.booked) {
            return true;
        }

        const bookable = this.form.get('bookable');
        if (bookable && status) {
            return (
                status.value !== BookingStatus.booked ||
                (bookable.value && bookable.value.bookingType === BookingType.admin_approved)
            );
        }

        return false;
    }

    /**
     * Wherever bookable is a service for example NFT
     */
    public isService(): void {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value.bookableTags.find(t => t.id === BookableTagService.SERVICE);
        }
    }

    public assignBookable(bookable): void {
        const message =
            'Êtes-vous sûr de vouloir attribuer cette prestation ou espace de stockage ? ' +
            'Cette action va créer une nouvelle réservation et débitera automatiquement le compte du membre. ' +
            'Pour annuler cette action, il sera nécessaire de supprimer la nouvelle réservation.';

        this.alertService.confirm("Confirmer l'attribution", message, 'Confirmer').subscribe(confirm => {
            if (confirm) {
                this.doAssignBookable(bookable);
            }
        });
    }

    public doAssignBookable(bookable): void {
        const partialBooking: BookingPartialInput = {status: BookingStatus.booked};
        this.bookingService.createWithBookable(bookable, this.data.model.owner, partialBooking).subscribe(booking => {
            this.newBooking = Object.assign(booking, {bookable: bookable});
            this.alertService.info('La réservation a été créée avec succès');
            const status = this.form.get('status');
            if (status) {
                status.setValue(BookingStatus.processed);
                this.update();
            }
        });
    }

    public getBookablesVariables(tags): BookablesVariables {
        const variables: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookingType: {in: {values: [BookingType.admin_only]}},
                                bookableTags: {have: {values: tags}},
                                isActive: {equal: {value: true}},
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
        };

        return variables;
    }
}
