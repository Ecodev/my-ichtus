import {Component, Injector, OnInit} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {
    BookableSortingField,
    BookablesVariables,
    BookableTags_bookableTags_items,
    BookingPartialInput,
    BookingStatus,
    BookingType,
    CreateBooking_createBooking,
    SortingOrder,
    UsageBookables_bookables_items,
} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {ExtractVall, NaturalAbstractDetail} from '@ecodev/natural';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
})
export class BookingComponent extends NaturalAbstractDetail<BookingService> implements OnInit {
    public BookingStatus = BookingStatus;
    public suggestionVariables: BookablesVariables = {};
    public BookingType = BookingType;

    public bookableFilterChips = [
        {name: 'Stockage et services effectifs', value: 'admin_assigned', selected: false},
        {name: 'Stockage et services pour demande', value: 'application', selected: false},
        {name: 'Cours nautiques', value: 'admin_approved', selected: false},
        {name: 'Carnet de sortie', value: 'self_approved', selected: false},
        {name: 'Services obligatoires', value: 'mandatory', selected: false},
    ];

    public bookableSelectFilter: ExtractVall<BookableService>['filter'];

    /**
     * Received the created booking after having processing an application
     */
    public newBooking: CreateBooking_createBooking | null = null;

    constructor(
        public readonly bookingService: BookingService,
        injector: Injector,
        public readonly bookableService: BookableService,
        public readonly userService: UserService,
    ) {
        super('booking', bookingService, injector);
        this.filterBookables(BookingType.admin_assigned);
    }

    public ngOnInit(): void {
        super.ngOnInit();

        const tags: BookableTags_bookableTags_items[] = this.form.get('bookable')?.value?.bookableTags;
        if (tags) {
            if (tags.find(t => t.id === BookableTagService.STORAGE)) {
                this.suggestionVariables = this.getBookablesVariables([BookableTagService.STORAGE]);
            } else if (tags.find(t => t.id === BookableTagService.FORMATION)) {
                this.suggestionVariables = this.getBookablesVariables([BookableTagService.FORMATION]);
            } else if (tags.find(t => t.id === BookableTagService.WELCOME)) {
                this.suggestionVariables = this.getBookablesVariables([BookableTagService.WELCOME]);
            }
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

    // For admin_approved bookings (courses...)
    public approveBooking(): void {
        const status = this.form.get('status');
        if (status) {
            status.setValue(BookingStatus.processed);
            this.update();
        }
    }

    public isSelfApproved(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value ? bookable.value.bookingType === BookingType.self_approved : false;
        }

        return false;
    }

    // Bookable of kind admin approved
    public isAdminApproved(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value ? bookable.value.bookingType === BookingType.admin_approved : false;
        }

        return false;
    }

    // Pending application for a service, storage or course
    public isPendingApplication(bookingType: BookingType | null = null): boolean {
        const status = this.form.get('status');
        const bookable = this.form.get('bookable');

        if (bookable && status) {
            return (
                status.value === BookingStatus.application &&
                bookable.value &&
                (bookingType != null ? bookable.value.bookingType === bookingType : true)
            );
        }

        return false;
    }

    /**
     * Wherever bookable is a service for example NFT
     */
    public isService(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value.bookableTags.find(
                (t: BookableTags_bookableTags_items) => t.id === BookableTagService.SERVICE,
            );
        }

        return false;
    }

    public assignBookable(bookable: UsageBookables_bookables_items): void {
        const message =
            'Es-tu certain(e) de vouloir attribuer cette prestation ou espace de stockage ? ' +
            'Cette action va créer une nouvelle réservation et débitera automatiquement le compte du membre. ' +
            'Pour annuler cette action, il sera nécessaire de supprimer la nouvelle réservation.';

        this.alertService.confirm("Confirmer l'attribution", message, 'Confirmer').subscribe(confirm => {
            if (confirm) {
                this.doAssignBookable(bookable);
            }
        });
    }

    public doAssignBookable(bookable: UsageBookables_bookables_items): void {
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

    public getBookablesVariables(tags: string[]): BookablesVariables {
        const variables: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookingType: {in: {values: [BookingType.admin_assigned]}},
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

    /**
     * Filter the bookable select box according to the category chips
     */
    public filterBookables(category: string): void {
        // Leave only the clicked category selected
        this.bookableFilterChips.forEach((chip, index) => {
            this.bookableFilterChips[index].selected = chip.value === category;
        });
        const bookingType = (BookingType as any)[category];
        this.bookableSelectFilter = {
            groups: [
                {
                    conditions: [
                        {
                            bookingType: {in: {values: [bookingType]}},
                            isActive: {equal: {value: true}},
                        },
                    ],
                },
            ],
        };
    }
}
