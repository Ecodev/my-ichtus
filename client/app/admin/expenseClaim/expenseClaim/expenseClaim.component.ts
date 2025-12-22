import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, OnInit} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalFileComponent,
    NaturalFixedButtonDetailComponent,
    NaturalIconDirective,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {ExpenseClaimService} from '../services/expenseClaim.service';
import {CurrentUserForProfile, ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {TransactionLineService} from '../../transactions/services/transactionLine.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {MatDivider} from '@angular/material/divider';
import {MatTooltip} from '@angular/material/tooltip';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-expense-claim',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatButton,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
        RouterLink,
        MoneyComponent,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatSuffix,
        MatInput,
        CdkTextareaAutosize,
        MatSelect,
        MatOption,
        MatTooltip,
        NaturalSelectEnumComponent,
        NaturalSelectComponent,
        MatDivider,
        NaturalFileComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
        AsyncPipe,
    ],
    templateUrl: './expenseClaim.component.html',
    styleUrl: './expenseClaim.component.scss',
})
export class ExpenseClaimComponent
    extends NaturalAbstractDetail<ExpenseClaimService, NaturalSeoResolveData>
    implements OnInit
{
    protected readonly userService = inject(UserService);
    protected readonly transactionLineService = inject(TransactionLineService);
    protected readonly permissionsService = inject(PermissionsService);

    protected readonly ExpenseClaimType = ExpenseClaimType;
    protected readonly ExpenseClaimStatus = ExpenseClaimStatus;
    protected viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public constructor() {
        super('expenseClaim', inject(ExpenseClaimService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.viewer = this.route.snapshot.data.viewer;
    }

    protected approve(): void {
        const reviewer = this.form.get('reviewer');
        if (reviewer) {
            reviewer.setValue(this.viewer);
            reviewer.markAsTouched();
        }
        const status = this.form.get('status');
        if (status) {
            status.setValue(ExpenseClaimStatus.Processing);
            status.markAsTouched();
        }
        if (this.form.touched) {
            this.update();
        }
    }
}
