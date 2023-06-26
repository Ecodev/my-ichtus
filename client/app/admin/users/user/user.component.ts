import {Component, OnInit} from '@angular/core';
import {IEnum, ifValid, NaturalAbstractDetail, NaturalQueryVariablesManager} from '@ecodev/natural';
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
import {UntypedFormControl} from '@angular/forms';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent extends NaturalAbstractDetail<UserService> implements OnInit {
    public showFamilyTab = false;
    public updating = false;
    public ibanLocked = true;
    public readonly ibanCtrl = new UntypedFormControl('', ibanValidator);

    public transactionLinesVariables: TransactionLinesVariables = {};

    public familyVariables: UsersVariables = {};

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    private userRolesAvailable: UserRole[] = [];

    public ownerFilter: UserFilter = {};
    public UserStatus = UserStatus;

    public constructor(
        private readonly userService: UserService,
        public readonly userTagService: UserTagService,
        public readonly licenseService: LicenseService,
        public readonly bookingService: BookingService,
        public readonly accountService: AccountService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('user', userService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;

        this.route.data.subscribe(() => {
            if (this.data.model.id) {
                const qvm = new NaturalQueryVariablesManager<UsersVariables>();
                qvm.set('variables', UserService.getFamilyVariables(this.data.model));
                this.userService.getAll(qvm).subscribe(family => {
                    this.showFamilyTab = family.items.length > 1;
                });

                this.familyVariables = UserService.getFamilyVariables(this.data.model);
                this.transactionLinesVariables = this.getTransactionQueryVariables();
            }
        });
    }

    protected override initForm(): void {
        super.initForm();

        this.userService.getUserRolesAvailable(this.data.model).subscribe(userRoles => {
            this.userRolesAvailable = userRoles;
        });

        this.ibanCtrl.setValue(friendlyFormatIBAN(this.data.model.iban), {emitEvent: false});
        this.ibanLocked = !!this.data.model.iban;
        if (!this.canUpdateIban()) {
            this.ibanCtrl.disable();
        }

        // Only users that can be owner (so not the users that are owned)
        const ownerConditions: UserFilterGroupCondition[] = [{owner: {null: {not: false}}}];

        // Exclude the user being updated to be selected as his own owner
        if (this.data.model.id) {
            ownerConditions.push({id: {equal: {value: this.data.model.id, not: true}}});
        }

        this.ownerFilter = {
            groups: [{conditions: ownerConditions}],
        };
    }

    public getTransactionQueryVariables(): TransactionLinesVariables {
        const account = this.data.model.account;
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
        return this.userService.canUpdateIban(this.viewer);
    }

    public updateIban(): void {
        if (!this.canUpdateIban()) {
            return;
        }
        ifValid(this.ibanCtrl).subscribe(() => {
            this.updating = true;
            this.ibanCtrl.enable();
            const iban = this.ibanCtrl.value;
            this.userService
                .updatePartially({id: this.data.model.id, iban: iban})
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
