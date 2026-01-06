import {
    NaturalAbstractDetail,
    NaturalErrorMessagePipe,
    NaturalFixedButtonComponent,
    NaturalSeoResolveData,
} from '@ecodev/natural';
import {Component, inject, OnInit, viewChild} from '@angular/core';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {CreateExpenseClaim, ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {AccountingDocumentsComponent} from '../../../admin/accounting-documents/accounting-documents.component';
import {EMPTY, Observable} from 'rxjs';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-create-expense-claim',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatHint,
        MatSuffix,
        MatInput,
        MatSelect,
        MatOption,
        CdkTextareaAutosize,
        AccountingDocumentsComponent,
        NaturalFixedButtonComponent,
    ],
    templateUrl: './create-expense-claim.component.html',
    styleUrl: './create-expense-claim.component.scss',
})
export class CreateExpenseClaimComponent
    extends NaturalAbstractDetail<ExpenseClaimService, NaturalSeoResolveData>
    implements OnInit
{
    protected readonly userService = inject(UserService);

    private readonly accountingDocuments = viewChild.required(AccountingDocumentsComponent);

    protected readonly ExpenseClaimType = ExpenseClaimType;

    public constructor() {
        super('expenseClaim', inject(ExpenseClaimService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.form.patchValue({
            owner: this.route.snapshot.data.viewer.id,
            status: ExpenseClaimStatus.New,
            type: this.route.snapshot.data.type,
        });
    }

    protected override postCreate(object: CreateExpenseClaim['createExpenseClaim']): Observable<unknown> {
        this.accountingDocuments().save(object);
        this.router.navigateByUrl('/profile/finances');
        this.alertService.info('Votre demande a bien été enregistrée');

        return EMPTY;
    }
}
