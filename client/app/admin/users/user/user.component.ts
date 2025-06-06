import {Component, inject, OnInit} from '@angular/core';
import {
    IEnum,
    ifValid,
    NaturalAbstractDetail,
    NaturalAvatarComponent,
    NaturalDetailHeaderComponent,
    NaturalFixedButtonDetailComponent,
    NaturalIconDirective,
    NaturalLinkableTabDirective,
    NaturalQueryVariablesManager,
    NaturalRelationsComponent,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
    NaturalTableButtonComponent,
    NaturalTimeAgoPipe,
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {UserService} from '../services/user.service';
import {
    CurrentUserForProfile,
    SortingOrder,
    TransactionLineSortingField,
    TransactionLinesVariables,
    UserFilter,
    UserFilterGroupCondition,
    UserRole,
    UserStatus,
    UsersVariables,
} from '../../../shared/generated-types';
import {LicenseService} from '../../licenses/services/license.service';
import {UserTagService} from '../../userTags/services/userTag.service';
import {BookingService} from '../../bookings/services/booking.service';
import {AccountService} from '../../accounts/services/account.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {iban as ibanValidator} from '../../../shared/validators';
import {friendlyFormatIBAN} from 'ibantools';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {ServicesComponent} from '../../../profile/components/services/services.component';
import {FinancesComponent} from '../../../profile/components/finances/finances.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TransactionLinesComponent} from '../../transactions/transactionLines/transactionLines.component';
import {UsersComponent} from '../users/users.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDividerModule} from '@angular/material/divider';
import {AddressComponent} from '../../../shared/components/address/address.component';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MoneyComponent} from '../../../shared/components/money/money.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MoneyComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        MatFormFieldModule,
        MatInputModule,
        NaturalSelectEnumComponent,
        AddressComponent,
        MatDividerModule,
        NaturalSelectComponent,
        MatDatepickerModule,
        MatCheckboxModule,
        TextFieldModule,
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalAvatarComponent,
        MatSlideToggleModule,
        NaturalStampComponent,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        UsersComponent,
        TransactionLinesComponent,
        MatTooltipModule,
        FinancesComponent,
        ServicesComponent,
        NaturalFixedButtonDetailComponent,
        DatePipe,
        NaturalTimeAgoPipe,
        AsyncPipe,
    ],
})
export class UserComponent extends NaturalAbstractDetail<UserService, NaturalSeoResolveData> implements OnInit {
    public readonly userTagService = inject(UserTagService);
    public readonly licenseService = inject(LicenseService);
    public readonly bookingService = inject(BookingService);
    public readonly accountService = inject(AccountService);
    public readonly permissionsService = inject(PermissionsService);

    public showFamilyTab = false;
    public updating = false;
    public ibanLocked = true;
    public readonly ibanCtrl = new FormControl('', ibanValidator);

    public transactionLinesVariables: TransactionLinesVariables = {};

    public familyVariables: UsersVariables = {};

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    private userRolesAvailable: UserRole[] = [];

    public ownerFilter: UserFilter = {};
    public readonly UserStatus = UserStatus;

    public constructor() {
        super('user', inject(UserService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer;

        this.route.data.subscribe(() => {
            if (this.isUpdatePage()) {
                const qvm = new NaturalQueryVariablesManager<UsersVariables>();
                qvm.set('variables', UserService.getFamilyVariables(this.data.model));
                this.service.getAll(qvm).subscribe(family => {
                    this.showFamilyTab = family.items.length > 1;
                });

                this.familyVariables = UserService.getFamilyVariables(this.data.model);
                this.transactionLinesVariables = this.getTransactionQueryVariables();
            }
        });
    }

    protected override initForm(): void {
        super.initForm();

        this.service.getUserRolesAvailable(this.data.model).subscribe(userRoles => {
            this.userRolesAvailable = userRoles;
        });

        this.ibanCtrl.setValue(friendlyFormatIBAN(this.data.model.iban ?? undefined), {emitEvent: false});

        this.ibanLocked = !!this.data.model.iban;
        if (!this.canUpdateIban()) {
            this.ibanCtrl.disable();
        }

        // Only users that can be owner (so not the users that are owned)
        const ownerConditions: UserFilterGroupCondition[] = [{owner: {null: {not: false}}}];

        // Exclude the user being updated to be selected as his own owner
        if (this.isUpdatePage()) {
            ownerConditions.push({id: {equal: {value: this.data.model.id, not: true}}});
        }

        this.ownerFilter = {
            groups: [{conditions: ownerConditions}],
        };
    }

    public getTransactionQueryVariables(): TransactionLinesVariables {
        const account = this.isUpdatePage() ? this.data.model.account : null;
        if (!account) {
            return {};
        }

        return {
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                custom: {creditOrDebitAccount: {values: [account.id]}},
                            },
                        ],
                    },
                ],
            },
            sorting: [{field: TransactionLineSortingField.transactionDate, order: SortingOrder.DESC}],
        };
    }

    public roleDisabled(): (item: IEnum) => boolean {
        return item => {
            return !this.userRolesAvailable.includes(item.value as UserRole);
        };
    }

    public canUpdateIban(): boolean {
        return this.service.canUpdateIban(this.viewer);
    }

    public updateIban(): void {
        if (!this.canUpdateIban()) {
            return;
        }

        ifValid(this.ibanCtrl).subscribe(() => {
            if (!this.isUpdatePage()) {
                return;
            }

            this.updating = true;
            this.ibanCtrl.enable();
            const iban = this.ibanCtrl.value;
            this.service
                .updateNow({id: this.data.model.id, iban: iban})
                .pipe(
                    finalize(() => {
                        this.updating = false;
                    }),
                )
                .subscribe({
                    next: user => {
                        this.alertService.info('Le IBAN a été modifié');
                        this.ibanCtrl.setValue(friendlyFormatIBAN(user.iban), {emitEvent: false});

                        // if we removed the IBAN keep the field unlocked
                        if (!user.iban) {
                            this.ibanCtrl.enable();
                        }
                    },
                    error: () => {
                        // If something wrong happend, unlock the input to suggest to the user to try again
                        this.ibanCtrl.enable();
                    },
                });
        });
    }

    public lockIbanIfDefined(): void {
        ifValid(this.ibanCtrl).subscribe(() => {
            if (this.ibanCtrl.value) {
                this.ibanCtrl.disable();
            }
        });
    }
}
