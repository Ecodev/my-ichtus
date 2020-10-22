import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractDetail, NaturalQueryVariablesManager} from '@ecodev/natural';
import {UserService} from '../services/user.service';
import {
    CreateUser,
    CreateUserVariables,
    LogicalOperator,
    Sex,
    SortingOrder,
    TransactionLineSortingField,
    TransactionLinesVariables,
    UpdateUser,
    UpdateUserVariables,
    User,
    UsersVariables,
    UserVariables,
} from '../../../shared/generated-types';
import {LicenseService} from '../../licenses/services/license.service';
import {UserTagService} from '../../userTags/services/userTag.service';
import {BookingService} from '../../bookings/services/booking.service';
import {AccountService} from '../../accounts/services/account.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent
    extends NaturalAbstractDetail<
        User['user'],
        UserVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        any,
        any
    >
    implements OnInit {
    public showFamilyTab;
    public UserService = UserService;

    public transactionLinesVariables;
    public familyVariables;

    constructor(
        private userService: UserService,
        injector: Injector,
        public userTagService: UserTagService,
        public licenseService: LicenseService,
        public bookingService: BookingService,
        public accountService: AccountService,
    ) {
        super('user', userService, injector);
    }

    public ngOnInit(): void {
        super.ngOnInit();

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

    public getTransactionQueryVariables(): TransactionLinesVariables {
        const account = this.data.model.account;
        if (!account) {
            return {};
        }

        return {
            filter: {
                groups: [
                    {
                        conditionsLogic: LogicalOperator.OR,
                        conditions: [{credit: {equal: {value: account.id}}}, {debit: {equal: {value: account.id}}}],
                    },
                ],
            },
            sorting: [{field: TransactionLineSortingField.transactionDate, order: SortingOrder.DESC}],
        };
    }
}
