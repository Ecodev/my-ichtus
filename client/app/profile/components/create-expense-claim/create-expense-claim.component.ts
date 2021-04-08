import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ExpenseClaimService} from '../../../admin/expenseClaim/services/expenseClaim.service';
import {CreateExpenseClaim_createExpenseClaim, ExpenseClaimStatus} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {AccountingDocumentsComponent} from '../../../admin/accounting-documents/accounting-documents.component';

@Component({
    selector: 'app-create-expense-claim',
    templateUrl: './create-expense-claim.component.html',
    styleUrls: ['./create-expense-claim.component.scss'],
})
export class CreateExpenseClaimComponent extends NaturalAbstractDetail<ExpenseClaimService> implements OnInit {
    @ViewChild(AccountingDocumentsComponent, {static: true}) private accountingDocuments!: AccountingDocumentsComponent;

    constructor(
        expenseClaimService: ExpenseClaimService,
        injector: Injector,
        public readonly userService: UserService,
    ) {
        super('expenseClaim', expenseClaimService, injector);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.form.patchValue({
            owner: this.route.snapshot.data.viewer.model.id,
            status: ExpenseClaimStatus.new,
        });
    }

    public postCreate(model: CreateExpenseClaim_createExpenseClaim): void {
        this.accountingDocuments.save();
        this.router.navigateByUrl('/profile/finances');
        this.alertService.info('Votre demande a bien été enregistrée');
    }
}
