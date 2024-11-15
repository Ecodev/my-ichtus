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
    BookingsVariables,
    BookingType,
    CreateImage,
    CurrentUserForProfile,
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
import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-bookable',
    templateUrl: './bookable.component.html',
    styleUrl: './bookable.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        CommonModule,
        MatButtonModule,
        MatTabsModule,
        NaturalLinkableTabDirective,
        NaturalFileComponent,
        MatFormFieldModule,
        MatInputModule,
        NaturalSelectEnumComponent,
        TextFieldModule,
        MatSlideToggleModule,
        NaturalSelectHierarchicComponent,
        MatDividerModule,
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalAvatarComponent,
        NaturalStampComponent,
        BookableMetadataComponent,
        TransactionLinesComponent,
        BookingsWithOwnerComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class BookableComponent extends NaturalAbstractDetail<BookableService, NaturalSeoResolveData> implements OnInit {
    public readonly bookableTagService = inject(BookableTagService);
    public readonly licenseService = inject(LicenseService);
    private readonly imageService = inject(ImageService);
    public readonly permissionsService = inject(PermissionsService);

    public accountHierarchicConfig = accountHierarchicConfiguration;
    public bookingsVariables: BookingsVariables = {};
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public readonly availableColumnsForBookingsWithOwnerWithoutTrainers =
        availableColumnsForBookingsWithOwnerWithoutTrainers;
    public readonly availableColumnsForBookingsWithOwnerOnlyTrainers = availableColumnsForBookingsWithOwnerOnlyTrainers;

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

    public verify(): void {
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

    public showVerified(): boolean {
        return this.data.model.bookingType === BookingType.SelfApproved;
    }

    public showWaitingList(): boolean {
        return this.data.model.bookingType === BookingType.AdminApproved;
    }

    /**
     * Only non-self-approved are applicable for pricing. This simplify GUI
     */
    public isBookingPriceApplicable(): boolean {
        return this.data.model.bookingType !== BookingType.SelfApproved;
    }

    public createImageAndLink(file: File): Observable<CreateImage['createImage']> {
        return this.imageService.create({file}).pipe(
            switchMap(image => {
                const id = this.data.model.id;
                return id ? this.service.updateNow({id, image}).pipe(map(() => image)) : of(image);
            }),
        );
    }

    public isSelfApproved(): boolean {
        return this.data.model.bookingType === BookingType.SelfApproved;
    }

    public getBookingsVariables(): BookingsVariables {
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

    public isTrainer(): boolean {
        return this.route.snapshot.data.viewer?.role === UserRole.trainer;
    }

    public bookingTypeDisabled(): (item: IEnum) => boolean {
        return item => {
            return (
                this.viewer.role === UserRole.formation_responsible &&
                (item.value as BookingType) !== BookingType.AdminApproved
            );
        };
    }
}
