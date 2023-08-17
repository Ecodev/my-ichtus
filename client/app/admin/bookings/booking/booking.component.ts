import {Component, OnInit} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {
    BookableSortingField,
    BookablesVariables,
    BookableTags,
    BookingPartialInput,
    BookingStatus,
    BookingType,
    CreateBooking,
    SortingOrder,
    UsageBookables,
} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {
    AvailableColumn,
    ExtractVall,
    formatIsoDateTime,
    NaturalAbstractDetail,
    NaturalSearchSelections,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {
    code,
    initialPrice,
    name,
    periodicPrice,
    select,
    availability,
} from '../../bookables/bookables/parent.component';
import {UsageBookablesComponent} from '../../bookables/bookables/usage-bookables.component';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {RouterLink} from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        FlexModule,
        CommonModule,
        MatButtonModule,
        MatTabsModule,
        NaturalLinkableTabDirective,
        NaturalSelectComponent,
        MatChipsModule,
        MatDividerModule,
        RouterLink,
        NaturalSelectEnumComponent,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        UsageBookablesComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
        NaturalSwissDatePipe,
    ],
})
export class BookingComponent extends NaturalAbstractDetail<BookingService> implements OnInit {
    public BookingStatus = BookingStatus;
    public suggestionVariables: BookablesVariables = {};
    public suggestionSelection: NaturalSearchSelections = [[]];
    public readonly BookingType = BookingType;
    public readonly availableColumns: Readonly<AvailableColumn>[] = [
        availability,
        name,
        code,
        initialPrice,
        periodicPrice,
        select,
    ];

    public readonly bookableFilterChips: {name: string; value: BookingType; selected: boolean}[] = [
        {name: 'Stockage et services effectifs', value: BookingType.admin_assigned, selected: false},
        {name: 'Stockage et services pour demande', value: BookingType.application, selected: false},
        {name: 'Cours', value: BookingType.admin_approved, selected: false},
        {name: 'Carnet de sortie', value: BookingType.self_approved, selected: false},
        {name: 'Services obligatoires', value: BookingType.mandatory, selected: false},
    ];

    public bookableSelectFilter: ExtractVall<BookableService>['filter'];

    /**
     * Special tags used to match application with actual bookables
     */
    private readonly suggestionTags = [
        BookableTagService.CASIER,
        BookableTagService.FLOTTEUR,
        BookableTagService.RATELIER_WB,
        BookableTagService.ARMOIRE,
        BookableTagService.STORAGE,
        BookableTagService.FORMATION,
        BookableTagService.WELCOME,
        BookableTagService.SERVICE,
    ];

    /**
     * Received the created booking after having processing an application
     */
    public newBooking: CreateBooking['createBooking'] | null = null;

    public constructor(
        public readonly bookingService: BookingService,
        public readonly bookableService: BookableService,
        public readonly userService: UserService,
    ) {
        super('booking', bookingService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        if (this.data?.model?.bookable?.bookingType) {
            // Filter bookables select according to existing bookable type
            this.filterBookables(this.data.model.bookable.bookingType);
        } else {
            // Default bookable filter on creation
            this.filterBookables(BookingType.admin_assigned);
        }

        const tags: BookableTags['bookableTags']['items'][0][] = this.form.get('bookable')?.value?.bookableTags;

        if (tags) {
            const matchingTag = tags.find(t => this.suggestionTags.includes(t.id));
            if (matchingTag) {
                this.suggestionVariables = this.getBookablesVariables([matchingTag.id]);
                this.suggestionSelection = this.getBookablesSelection();
            }
        }
    }

    public endBooking(): void {
        this.bookingService.terminateBooking(this.data.model.id).subscribe(() => {
            const endDate = this.form.get('endDate');
            if (endDate) {
                endDate.setValue(formatIsoDateTime(new Date()));
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
                (t: BookableTags['bookableTags']['items'][0]) => t.id === BookableTagService.SERVICE,
            );
        }

        return false;
    }

    public assignBookable(bookable: UsageBookables['bookables']['items'][0]): void {
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

    public doAssignBookable(bookable: UsageBookables['bookables']['items'][0]): void {
        const partialBooking: BookingPartialInput = {status: BookingStatus.booked};
        this.bookingService.createWithBookable(bookable, this.data.model.owner, partialBooking).subscribe(booking => {
            this.newBooking = Object.assign(booking, {bookable: bookable});
            this.alertService.info('La réservation a été créée avec succès');
            this.bookingService.terminateBooking(this.data.model.id).subscribe(() => {
                const endDate = this.form.get('endDate');
                const status = this.form.get('status');
                if (endDate) {
                    endDate.setValue(formatIsoDateTime(new Date()));
                }
                if (status) {
                    status.setValue(BookingStatus.processed);
                }
                this.update();
            });
        });
    }

    public getBookablesVariables(tags: string[]): BookablesVariables {
        const variables: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookingType: {in: {values: [BookingType.admin_assigned, BookingType.admin_approved]}},
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

    public getBookablesSelection(): NaturalSearchSelections {
        return [
            [
                {
                    field: 'bookableBookingCount',
                    condition: {
                        equal: {
                            value: 0,
                        },
                    },
                },
            ],
        ];
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
