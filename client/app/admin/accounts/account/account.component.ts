import {Component, OnInit} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalIconDirective,
    NaturalSelectHierarchicComponent,
    NaturalSelectEnumComponent,
    NaturalSelectComponent,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
} from '@ecodev/natural';
import {AccountService} from '../services/account.service';
import {UserService} from '../../users/services/user.service';
import {groupAccountHierarchicConfiguration} from '../../../shared/hierarchic-selector/GroupAccountHierarchicConfiguration';
import {friendlyFormatIBAN} from 'ibantools';
import {IbanPipe} from '../../../shared/pipes/iban.pipe';
import {MatDividerModule} from '@angular/material/divider';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatTabsModule} from '@angular/material/tabs';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MoneyComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        NgIf,
        NaturalSelectHierarchicComponent,
        NaturalSelectEnumComponent,
        NaturalSelectComponent,
        MatDividerModule,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
        IbanPipe,
    ],
})
export class AccountComponent extends NaturalAbstractDetail<AccountService> implements OnInit {
    public nextCodeAvailable: number | null = null;
    public accountHierarchicConfig = groupAccountHierarchicConfiguration;

    public constructor(public readonly accountService: AccountService, public readonly userService: UserService) {
        super('account', accountService);
    }

    public override ngOnInit(): void {
        super.ngOnInit();

        this.accountService.getNextCodeAvailable().subscribe(code => {
            this.nextCodeAvailable = code;
            if (!this.data.model.id) {
                const codeField = this.form.get('code');
                if (codeField) {
                    codeField.setValue(code);
                }
            }
        });

        const parentId = this.route.snapshot.params['parent'];
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

        // Format IBAN coming from server to be user friendly
        this.form.get('iban')?.setValue(friendlyFormatIBAN(this.form.get('iban')?.value));
    }

    public updateLinkedFields(): void {
        const typeField = this.form.get('type');
        if (typeField && typeField.value !== 'liability') {
            const ownerField = this.form.get('owner');
            if (ownerField) {
                ownerField.setValue(null);
            }
        }
        if (typeField && typeField.value !== 'asset') {
            const ibanField = this.form.get('iban');
            if (ibanField) {
                ibanField.setValue('');
            }
        }
    }
}
