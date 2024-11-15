import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {ApplicationConfirmData} from '../bookables/parent.component';
import {UsersVariables} from '../../../shared/generated-types';
import {UserService} from '../../users/services/user.service';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
    selector: 'app-application-confirm',
    templateUrl: './application-confirm.component.html',
    standalone: true,
    imports: [MatDialogModule, MatButton, MatHint, MatFormField, MatLabel, MatOption, ReactiveFormsModule, MatSelect],
})
// This dialog is only displayed when the user submits an application for a COURSE
export class ApplicationConfirmComponent {
    private readonly userService = inject(UserService);
    private readonly futureOwner = inject<ApplicationConfirmData>(MAT_DIALOG_DATA);

    public readonly participant = new FormControl<string | null>(null, [Validators.required]);
    public familyMembers: string[] = [];

    public constructor() {
        const futureOwner = this.futureOwner;

        if (futureOwner) {
            // Populate the select menu with his/her family members
            const qvm = new NaturalQueryVariablesManager<UsersVariables>();
            qvm.set('variables', UserService.getFamilyVariables(futureOwner));
            this.userService.getAll(qvm).subscribe(family => {
                this.familyMembers = family.items.map(member => member.name);
            });
        }

        // By default, the course participant will be the requesting user
        this.participant.setValue(futureOwner ? futureOwner.name : null);
    }
}
