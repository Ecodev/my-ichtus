import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {AccountService} from '../services/account.service';
import {UserService} from '../../users/services/user.service';
import {groupAccountHierarchicConfiguration} from '../../../shared/hierarchic-selector/GroupAccountHierarchicConfiguration';
import {friendlyFormatIBAN} from 'ibantools';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent extends NaturalAbstractDetail<AccountService> implements OnInit {
    public nextCodeAvailable: number | null = null;
    public accountHierarchicConfig = groupAccountHierarchicConfiguration;

    public constructor(
        public readonly accountService: AccountService,
        injector: Injector,
        public readonly userService: UserService,
    ) {
        super('account', accountService, injector);
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
