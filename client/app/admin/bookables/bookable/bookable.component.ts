import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, OnInit} from '@angular/core';
import {
    formatIsoDateTime,
    IEnum,
    NaturalAbstractDetail,
    NaturalAvatarComponent,
    NaturalDetailHeaderComponent,
    NaturalFileComponent,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalRelationsComponent,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSelectHierarchicComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {BookableService} from '../services/bookable.service';
import {
    BookingFilterGroupCondition,
    BookingSortingField,
    BookingStatus,
    BookingsQueryVariables,
    BookingType,
    CreateImage,
    CurrentUserForProfileQuery,
    SortingOrder,
    UserRole,
} from '../../../shared/generated-types';
import {LicenseService} from '../../licenses/services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookableTagService} from '../../bookableTags/services/bookableTag.service';
import {ImageService} from '../services/image.service';
import {accountHierarchicConfiguration} from '../../../shared/hierarchic-selector/AccountHierarchicConfiguration';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {
    availableColumnsForBookingsWithOwnerOnlyTrainers,
    availableColumnsForBookingsWithOwnerWithoutTrainers,
} from '../../bookings/bookings/abstract-bookings';
import {BookingsWithOwnerComponent} from '../../bookings/bookings/bookings-with-owner.component';
import {TransactionLinesComponent} from '../../transactions/transactionLines/transactionLines.component';
import {BookableMetadataComponent} from '../../bookable-metadata/bookable-metadata.component';
import {MatDivider} from '@angular/material/divider';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-bookable',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        DatePipe,
        MatButton,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        NaturalFileComponent,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatHint,
        MatSuffix,
        MatInput,
        NaturalSelectEnumComponent,
        CdkTextareaAutosize,
        NaturalSelectHierarchicComponent,
        MatDivider,
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalAvatarComponent,
        NaturalStampComponent,
        BookableMetadataComponent,
        TransactionLinesComponent,
        BookingsWithOwnerComponent,
        NaturalFixedButtonDetailComponent,
        NaturalSelectComponent,
    ],
    templateUrl: './bookable.component.html',
    styleUrl: './bookable.component.scss',
})
export class BookableComponent extends NaturalAbstractDetail<BookableService, NaturalSeoResolveData> implements OnInit {
    protected readonly bookableTagService = inject(BookableTagService);
    protected readonly licenseService = inject(LicenseService);
    private readonly imageService = inject(ImageService);
    protected readonly permissionsService = inject(PermissionsService);
    protected readonly userService = inject(UserService);

    protected accountHierarchicConfig = accountHierarchicConfiguration;
    protected bookingsVariables: BookingsQueryVariables = {};
    protected viewer!: NonNullable<CurrentUserForProfileQuery['viewer']>;
    protected readonly availableColumnsForBookingsWithOwnerWithoutTrainers =
        availableColumnsForBookingsWithOwnerWithoutTrainers;
    protected readonly availableColumnsForBookingsWithOwnerOnlyTrainers =
        availableColumnsForBookingsWithOwnerOnlyTrainers;

    public constructor() {
        super('bookable', inject(BookableService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        // While not saved, automatically update simultaneousBookingMaximum to 1 if navigable (self-approved) or -1 if other.
        if (!this.data.model.id) {
            const bookingType = this.form.controls.bookingType;
            const simultaneousBookingMaximum = this.form.controls.simultaneousBookingMaximum;
            bookingType.valueChanges
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(value => simultaneousBookingMaximum.setValue(value === BookingType.SelfApproved ? 1 : -1));
        }

        this.viewer = this.route.snapshot.data.viewer;

        this.bookingsVariables = this.getBookingsVariables();

        if (this.viewer.role === UserRole.formation_responsible) {
            this.form.controls.bookingType.setValue(BookingType.AdminApproved);
        }
    }

    protected verify(): void {
        if (!this.isUpdatePage()) {
            return;
        }

        this.service
            .updateNow({
                id: this.data.model.id,
                verificationDate: formatIsoDateTime(new Date()),
            })
            .subscribe(bookable => {
                this.form.patchValue(bookable);
            });
    }

    protected showVerified(): boolean {
        return this.data.model.bookingType === BookingType.SelfApproved;
    }

    protected showWaitingList(): boolean {
        return this.data.model.bookingType === BookingType.AdminApproved;
    }

    /**
     * Only non-self-approved are applicable for pricing. This simplify GUI
     */
    protected isBookingPriceApplicable(): boolean {
        return this.data.model.bookingType !== BookingType.SelfApproved;
    }

    protected createImageAndLink(file: File): Observable<CreateImage['createImage']> {
        return this.imageService.create({file}).pipe(
            switchMap(image => {
                const id = this.data.model.id;
                return id ? this.service.updateNow({id, image}).pipe(map(() => image)) : of(image);
            }),
        );
    }

    protected isSelfApproved(): boolean {
        return this.data.model.bookingType === BookingType.SelfApproved;
    }

    protected getBookingsVariables(): BookingsQueryVariables {
        if (!this.isUpdatePage()) {
            return {};
        }

        const conditions: BookingFilterGroupCondition[] = [
            {
                bookable: {have: {values: [this.data.model.id]}},
            },
            {
                status: {in: {values: [BookingStatus.Application], not: true}},
            },
        ];

        // Hide terminated bookings for courses/services (cancellation by the user)
        // but still show them for equipment rental
        if (!this.isSelfApproved()) {
            conditions.push({
                endDate: {null: {}},
            });
        }

        return {
            filter: {
                groups: [
                    {
                        conditions: conditions,
                    },
                ],
            },
            sorting: [{field: BookingSortingField.startDate, order: SortingOrder.DESC}],
        };
    }

    protected isTrainer(): boolean {
        return this.route.snapshot.data.viewer?.role === UserRole.trainer;
    }

    protected bookingTypeDisabled(): (item: IEnum) => boolean {
        return item => {
            return (
                this.viewer.role === UserRole.formation_responsible &&
                (item.value as BookingType) !== BookingType.AdminApproved
            );
        };
    }
}
