import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, OnInit} from '@angular/core';
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
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {startWith, switchMap} from 'rxjs';
import {AccountType} from '../../../shared/generated-types';
import {MatTooltip} from '@angular/material/tooltip';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-account',
    imports: [
        FormsModule,
        IbanPipe,
        MatIconButton,
        MatDivider,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatHint,
        MatSuffix,
        MatIcon,
        MatInput,
        MatTab,
        MatTabGroup,
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
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss',
})
export class AccountComponent extends NaturalAbstractDetail<AccountService, NaturalSeoResolveData> implements OnInit {
    public readonly userService = inject(UserService);

    public nextCodeAvailable: number | null = null;
    public accountHierarchicConfig = groupAccountHierarchicConfiguration;
    public readonly AccountType = AccountType;

    public constructor() {
        super('account', inject(AccountService));
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        const parentId = this.route.snapshot.params.parent;
        if (parentId) {
            this.service.getOne(parentId).subscribe(parentAccount => {
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
                takeUntilDestroyed(this.destroyRef),
                switchMap(value => {
                    this.nextCodeAvailable = null; // Hide invalid code as soon as we can

                    return this.service.getNextCodeAvailable(value ? value.id : null);
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

    protected updateLinkedFields(): void {
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
}
