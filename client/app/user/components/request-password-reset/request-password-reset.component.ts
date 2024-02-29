import {Apollo} from 'apollo-angular';
import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../../admin/users/services/user.service';
import {ifValid, NaturalAlertService, validateAllFormControls, NaturalIconDirective} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-request-password-reset',
    templateUrl: './request-password-reset.component.html',
    styleUrls: ['./request-password-reset.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        MatButtonModule,
    ],
})
export class RequestPasswordResetComponent {
    public readonly form: FormGroup;
    public sending = false;

    public constructor(
        private readonly apollo: Apollo,
        private readonly alertService: NaturalAlertService,
        private readonly router: Router,
        private readonly userService: UserService,
    ) {
        this.form = new FormGroup({login: new FormControl('', [Validators.required])});
    }

    public submit(): void {
        validateAllFormControls(this.form);
        ifValid(this.form).subscribe(() => {
            this.sending = true;

            this.userService.requestPasswordReset(this.form.value.login).subscribe({
                next: sentToFamilyOwner => {
                    this.sending = false;

                    let message;
                    if (sentToFamilyOwner) {
                        message = 'Un email avec des instructions a été envoyé au chef(e) de famille';
                    } else {
                        message = 'Un email avec des instructions a été envoyé';
                    }

                    this.alertService.info(message, 5000);
                    this.router.navigate(['/login']);
                },
                error: () => (this.sending = false),
            });
        });
    }
}
