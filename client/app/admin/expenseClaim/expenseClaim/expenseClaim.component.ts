import {Component, OnInit} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalIconDirective,
    NaturalSelectEnumComponent,
    NaturalSelectComponent,
    NaturalFileComponent,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
    NaturalSeoResolveData,
} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {CurrentUserForProfile, ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-expense-claim',
    templateUrl: './expenseClaim.component.html',
    styleUrls: ['./expenseClaim.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        FlexModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        RouterLink,
        MoneyComponent,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        NaturalSelectEnumComponent,
        NaturalSelectComponent,
        MatDividerModule,
        NaturalFileComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class ExpenseClaimComponent
    extends NaturalAbstractDetail<ExpenseClaimService, NaturalSeoResolveData>
    implements OnInit
{
    public ExpenseClaimType = ExpenseClaimType;
    public ExpenseClaimStatus = ExpenseClaimStatus;
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public constructor(
        public readonly expenseClaimService: ExpenseClaimService,
        public readonly userService: UserService,
        public readonly transactionLineService: TransactionLineService,
        public readonly permissionsService: PermissionsService,
    ) {
        super('expenseClaim', expenseClaimService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer.model;
    }

    public approve(): void {
        const reviewer = this.form.get('reviewer');
        if (reviewer) {
            reviewer.setValue(this.viewer);
            reviewer.markAsTouched();
        }
        const status = this.form.get('status');
        if (status) {
            status.setValue(ExpenseClaimStatus.processing);
            status.markAsTouched();
        }
        if (this.form.touched) {
            this.update();
        }
    }
}
