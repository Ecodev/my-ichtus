import {Component, inject, OnInit} from '@angular/core';
import {BookingService} from '../services/booking.service';
import {
    BookableSortingField,
    BookableStatus,
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
    NaturalDetailHeaderComponent,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalSearchSelections,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {DatePipe} from '@angular/common';
import {
    availability,
    code,
    initialPrice,
    name,
    periodicPrice,
    select,
} from '../../bookables/bookables/parent.component';
import {UsageBookablesComponent} from '../../bookables/bookables/usage-bookables.component';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {RouterLink} from '@angular/router';
import {MatDivider} from '@angular/material/divider';
import {MatChipListbox, MatChipOption} from '@angular/material/chips';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-booking',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatButton,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        NaturalSelectComponent,
        MatChipListbox,
        MatChipOption,
        MatDivider,
        RouterLink,
        NaturalSelectEnumComponent,
        MatFormField,
        MatLabel,
        MatInput,
        CdkTextareaAutosize,
        UsageBookablesComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
        DatePipe,
    ],
    templateUrl: './booking.component.html',
    styleUrl: './booking.component.scss',
})
export class BookingComponent extends NaturalAbstractDetail<BookingService, NaturalSeoResolveData> implements OnInit {
    public readonly bookableService = inject(BookableService);
    public readonly userService = inject(UserService);

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
        {name: 'Stockage et services effectifs', value: BookingType.AdminAssigned, selected: false},
        {name: 'Stockage et services pour demande', value: BookingType.Application, selected: false},
        {name: 'Cours', value: BookingType.AdminApproved, selected: false},
        {name: 'Carnet de sortie', value: BookingType.SelfApproved, selected: false},
        {name: 'Services obligatoires', value: BookingType.Mandatory, selected: false},
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

    public constructor() {
        super('booking', inject(BookingService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        if (this.data?.model?.bookable?.bookingType) {
            // Filter bookables select according to existing bookable type
            this.filterBookables(this.data.model.bookable.bookingType);
        } else {
            // Default bookable filter on creation
            this.filterBookables(BookingType.AdminAssigned);
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

    protected terminateBooking(): void {
        if (!this.isUpdatePage()) {
            return;
        }

        this.service.terminateBooking(this.data.model.id).subscribe(() => {
            const endDate = this.form.get('endDate');
            if (endDate) {
                endDate.setValue(formatIsoDateTime(new Date()));
            }
        });
    }

    protected unTerminateBooking(): void {
        if (!this.isUpdatePage()) {
            return;
        }

        this.service.updateNow({id: this.data.model.id, endDate: null}).subscribe(() => {
            this.form.controls.endDate.setValue(null);
        });
    }

    // For admin_approved bookings (courses...)
    protected approveBooking(): void {
        const status = this.form.get('status');
        if (status) {
            status.setValue(BookingStatus.Processed);
            this.update(true);
        }
    }

    protected isSelfApproved(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value ? bookable.value.bookingType === BookingType.SelfApproved : false;
        }

        return false;
    }

    // Bookable of kind admin approved
    protected isAdminApproved(): boolean {
        const bookable = this.form.get('bookable');
        if (bookable) {
            return bookable.value ? bookable.value.bookingType === BookingType.AdminApproved : false;
        }

        return false;
    }

    // Pending application for a service, storage or course
    protected isPendingApplication(bookingType: BookingType | null = null): boolean {
        const status = this.form.get('status');
        const bookable = this.form.get('bookable');

        if (bookable && status) {
            return (
                status.value === BookingStatus.Application &&
                bookable.value &&
                (bookingType != null ? bookable.value.bookingType === bookingType : true)
            );
        }

        return false;
    }

    protected assignBookable(bookable: UsageBookables['bookables']['items'][0]): void {
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

    protected doAssignBookable(bookable: UsageBookables['bookables']['items'][0]): void {
        const partialBooking: BookingPartialInput = {status: BookingStatus.Booked};
        this.service.createWithBookable(bookable, this.data.model.owner, partialBooking).subscribe(booking => {
            if (!this.isUpdatePage()) {
                return;
            }

            this.newBooking = Object.assign(booking, {bookable: bookable});
            this.alertService.info('La réservation a été créée avec succès');
            this.service.terminateBooking(this.data.model.id).subscribe(() => {
                const endDate = this.form.get('endDate');
                const status = this.form.get('status');
                if (endDate) {
                    endDate.setValue(formatIsoDateTime(new Date()));
                }
                if (status) {
                    status.setValue(BookingStatus.Processed);
                }
                this.update(true);
            });
        });
    }

    protected getBookablesVariables(tags: string[]): BookablesVariables {
        const variables: BookablesVariables = {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                bookingType: {in: {values: [BookingType.AdminAssigned, BookingType.AdminApproved]}},
                                bookableTags: {have: {values: tags}},
                                status: {equal: {value: BookableStatus.Active}},
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: BookableSortingField.creationDate, order: SortingOrder.DESC}],
        };

        return variables;
    }

    protected getBookablesSelection(): NaturalSearchSelections {
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
    protected filterBookables(category: BookingType): void {
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
                            status: {equal: {value: BookableStatus.Active}},
                        },
                    ],
                },
            ],
        };
    }
}
