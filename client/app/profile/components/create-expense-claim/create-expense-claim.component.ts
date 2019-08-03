import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpenseClaimService } from '../../../admin/expenseClaim/services/expenseClaim.service';
import {
    CreateExpenseClaim,
    CreateExpenseClaimVariables,
    ExpenseClaim,
    ExpenseClaimStatus,
    ExpenseClaimVariables,
    UpdateExpenseClaim,
    UpdateExpenseClaimVariables,
} from '../../../shared/generated-types';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../admin/users/services/user.service';
import { NaturalAlertService } from '@ecodev/natural';
import { AccountingDocumentsComponent } from '../../../admin/accounting-documents/accounting-documents.component';
import { NaturalAbstractDetail } from '@ecodev/natural';

@Component({
    selector: 'app-create-expense-claim',
    templateUrl: './create-expense-claim.component.html',
    styleUrls: ['./create-expense-claim.component.scss'],
})
export class CreateExpenseClaimComponent
    extends NaturalAbstractDetail<ExpenseClaim['expenseClaim'],
        ExpenseClaimVariables,
        CreateExpenseClaim['createExpenseClaim'],
        CreateExpenseClaimVariables,
        UpdateExpenseClaim['updateExpenseClaim'],
        UpdateExpenseClaimVariables,
        any> implements OnInit {

    @ViewChild(AccountingDocumentsComponent, { static: true }) accountingDocuments: AccountingDocumentsComponent;

    constructor(alertService: NaturalAlertService,
                expenseClaimService: ExpenseClaimService,
                router: Router,
                route: ActivatedRoute,
                public userService: UserService,
    ) {
        super('expenseClaim', expenseClaimService, alertService, router, route);
    }

    ngOnInit() {
        super.ngOnInit();
        this.form.patchValue({
            owner: this.route.snapshot.data.viewer.model.id,
            status: ExpenseClaimStatus.new,
        });
    }

    public postCreate(model) {
        this.accountingDocuments.save();
        this.router.navigateByUrl('/profile/finances');
        this.alertService.info('Votre demande a bien été enregistrée');
    }

}
