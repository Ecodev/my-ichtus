import {Component, OnInit} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalFixedButtonDetailComponent,
    NaturalIconDirective,
    NaturalLinkableTabDirective,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSelectHierarchicComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {AccountService} from '../services/account.service';
import {UserService} from '../../users/services/user.service';
import {groupAccountHierarchicConfiguration} from '../../../shared/hierarchic-selector/GroupAccountHierarchicConfiguration';
import {friendlyFormatIBAN} from 'ibantools';
import {IbanPipe} from '../../../shared/pipes/iban.pipe';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import Big from 'big.js';
import {startWith, switchMap, takeUntil} from 'rxjs';
import {AccountType} from '../../../shared/generated-types';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        IbanPipe,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatTooltipModule,
        MatTooltip,
        MoneyComponent,
        NaturalDetailHeaderComponent,
        NaturalFixedButtonDetailComponent,
        NaturalIconDirective,
        NaturalLinkableTabDirective,
        NaturalSelectComponent,
        NaturalSelectEnumComponent,
        NaturalSelectHierarchicComponent,
        NaturalStampComponent,
        ReactiveFormsModule,
    ],
})
export class AccountComponent extends NaturalAbstractDetail<AccountService, NaturalSeoResolveData> implements OnInit {
    public nextCodeAvailable: number | null = null;
    public accountHierarchicConfig = groupAccountHierarchicConfiguration;
    public readonly AccountType = AccountType;

    public constructor(
        public readonly accountService: AccountService,
        public readonly userService: UserService,
    ) {
        super('account', accountService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        const parentId = this.route.snapshot.params.parent;
        if (parentId) {
            this.accountService.getOne(parentId).subscribe(parentAccount => {
                const parentField = this.form.get('parent');
                if (parentAccount.id && parentField) {
                    parentField.setValue({
                        id: parentAccount.id,
                        name: [parentAccount.code, parentAccount.name].join(' '),
                    });
                }
            });
        }
    }

    protected override initForm(): void {
        super.initForm();

        // Show next available code
        const parent = this.form.get('parent')!;
        parent.valueChanges
            .pipe(
                startWith(parent.value),
                takeUntil(this.ngUnsubscribe),
                switchMap(value => {
                    this.nextCodeAvailable = null; // Hide invalid code as soon as we can

                    return this.accountService.getNextCodeAvailable(value ? value.id : null);
                }),
            )
            .subscribe(code => {
                this.nextCodeAvailable = code;
                if (!this.isUpdatePage()) {
                    this.form.get('code')!.setValue(code);
                }
            });

        // Format IBAN coming from server to be user friendly
        this.form.get('iban')?.setValue(friendlyFormatIBAN(this.form.get('iban')?.value));
    }

    public updateLinkedFields(): void {
        const typeField = this.form.get('type');
        if (typeField && typeField.value !== AccountType.Liability) {
            const ownerField = this.form.get('owner');
            if (ownerField) {
                ownerField.setValue(null);
            }
        }
        if (typeField && typeField.value !== AccountType.Asset) {
            const ibanField = this.form.get('iban');
            if (ibanField) {
                ibanField.setValue('');
            }
        }
    }

    public budgetBalance(): string {
        const allowed = this.form.get('budgetAllowed')?.value;
        if (!this.isUpdatePage() || allowed === null) {
            return '';
        }

        return Big(allowed).minus(this.data.model.totalBalance).toFixed(2);
    }
}
