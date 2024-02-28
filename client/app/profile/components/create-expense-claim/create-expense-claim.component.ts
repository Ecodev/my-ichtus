import {Component, OnInit, ViewChild} from '@angular/core';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {ExpenseClaimStatus, ExpenseClaimType} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {NaturalAbstractDetail, NaturalFixedButtonComponent, NaturalSeoResolveData} from '@ecodev/natural';
import {AccountingDocumentsComponent} from '../../../admin/accounting-documents/accounting-documents.component';
import {EMPTY, Observable} from 'rxjs';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-create-expense-claim',
    templateUrl: './create-expense-claim.component.html',
    styleUrls: ['./create-expense-claim.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        TextFieldModule,
        AccountingDocumentsComponent,
        NaturalFixedButtonComponent,
    ],
})
export class CreateExpenseClaimComponent
    extends NaturalAbstractDetail<ExpenseClaimService, NaturalSeoResolveData>
    implements OnInit
{
    @ViewChild(AccountingDocumentsComponent, {static: true}) private accountingDocuments!: AccountingDocumentsComponent;

    public ExpenseClaimType = ExpenseClaimType;

    public constructor(
        public expenseClaimService: ExpenseClaimService,
        public readonly userService: UserService,
    ) {
        super('expenseClaim', expenseClaimService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.form.patchValue({
            owner: this.route.snapshot.data.viewer.model.id,
            status: ExpenseClaimStatus.new,
            type: this.route.snapshot.data.type,
        });
    }

    protected override postCreate(): Observable<unknown> {
        this.accountingDocuments.save();
        this.router.navigateByUrl('/profile/finances');
        this.alertService.info('Votre demande a bien été enregistrée');

        return EMPTY;
    }
}
