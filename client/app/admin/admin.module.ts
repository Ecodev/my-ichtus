import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {BookablesComponent} from './bookables/bookables/bookables.component';
import {AdminComponent} from './admin/admin.component';
import {AvatarModule} from 'ngx-avatar';
import {BookableComponent} from './bookables/bookable/bookable.component';
import {MaterialModule} from '../shared/modules/material.module';
import {IchtusModule} from '../shared/modules/ichtus.module';
import {LicensesComponent} from './licenses/licenses/licenses.component';
import {LicenseComponent} from './licenses/license/license.component';
import {UserTagsComponent} from './userTags/userTags/userTags.component';
import {UserTagComponent} from './userTags/userTag/userTag.component';
import {UserComponent} from './users/user/user.component';
import {UsersComponent} from './users/users/users.component';
import {BookingsComponent} from './bookings/bookings/bookings.component';
import {BookingComponent} from './bookings/booking/booking.component';
import {BookableTagsComponent} from './bookableTags/bookableTags/bookableTags.component';
import {BookableTagComponent} from './bookableTags/bookableTag/bookableTag.component';

import {ExpenseClaimComponent} from './expenseClaim/expenseClaim/expenseClaim.component';
import {ExpenseClaimsComponent} from './expenseClaim/expenseClaims/expenseClaims.component';
import {ImportComponent} from './import/import.component';
import {EditableTransactionLinesComponent} from './transactions/editable-transaction-lines/editable-transaction-lines.component';
import {TransactionComponent} from './transactions/transaction/transaction.component';
import {AccountsComponent} from './accounts/accounts/accounts.component';
import {AccountComponent} from './accounts/account/account.component';
import {TransactionTagsComponent} from './transactionTags/transactionTags/transactionTags.component';
import {TransactionTagComponent} from './transactionTags/transactionTag/transactionTag.component';
import {TransactionLinesComponent} from './transactions/transactionLines/transactionLines.component';
import {SelectAdminOnlyModalComponent} from '../shared/components/select-admin-only-modal/select-admin-only-modal.component';
import {ProfileModule} from '../profile/profile.module';
import {BookableMetadataComponent} from './bookable-metadata/bookable-metadata.component';
import {EcoFabSpeedDialModule} from '@ecodev/fab-speed-dial';
import {LogsComponent} from './logs/logs/logs.component';
import {UsageBookablesComponent} from './bookables/bookables/usage-bookables.component';
import {BookingsWithOwnerComponent} from './bookings/bookings/bookings-with-owner.component';

@NgModule({
    declarations: [
        UsageBookablesComponent,
        BookablesComponent,
        BookableComponent,
        AdminComponent,
        BookingsComponent,
        BookingsWithOwnerComponent,
        UsersComponent,
        UserComponent,
        LicensesComponent,
        LicenseComponent,
        UserTagsComponent,
        UserTagComponent,
        BookingComponent,
        BookableTagsComponent,
        BookableTagComponent,
        TransactionComponent,
        TransactionLinesComponent,
        AccountsComponent,
        AccountComponent,
        ExpenseClaimsComponent,
        ExpenseClaimComponent,
        TransactionTagsComponent,
        TransactionTagComponent,
        EditableTransactionLinesComponent,
        SelectAdminOnlyModalComponent,
        BookableMetadataComponent,
        ImportComponent,
        LogsComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MaterialModule,
        IchtusModule,
        AvatarModule,
        ProfileModule,
        EcoFabSpeedDialModule,
    ],
    entryComponents: [SelectAdminOnlyModalComponent],
})
export class AdminModule {}
