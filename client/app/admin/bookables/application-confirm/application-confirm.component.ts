import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {ApplicationConfirmData} from '../bookables/parent.component';
import {UsersVariables} from '../../../shared/generated-types';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../users/services/user.service';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
    selector: 'app-application-confirm',
    templateUrl: './application-confirm.component.html',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButton,
        MatHint,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatOption,
        MatSuffix,
        ReactiveFormsModule,
        MatSelect,
    ],
})
// This dialog is only displayed when the user submits an application for a COURSE
export class ApplicationConfirmComponent {
    public readonly participant = new FormControl<string | null>(null, [Validators.required]);
    public familyMembers: string[] = [];

    public constructor(
        private readonly route: ActivatedRoute,
        private readonly userService: UserService,
        public dialogRef: MatDialogRef<ApplicationConfirmComponent>,
        @Inject(MAT_DIALOG_DATA) private readonly futureOwner: ApplicationConfirmData,
    ) {
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
