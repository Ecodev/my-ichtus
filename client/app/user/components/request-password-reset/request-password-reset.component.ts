import {Apollo} from 'apollo-angular';
import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../../admin/users/services/user.service';
import {ifValid, NaturalAlertService, NaturalIconDirective, validateAllFormControls} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-request-password-reset',
    templateUrl: './request-password-reset.component.html',
    styleUrl: './request-password-reset.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        MatButtonModule,
    ],
})
export class RequestPasswordResetComponent {
    private readonly apollo = inject(Apollo);
    private readonly alertService = inject(NaturalAlertService);
    private readonly router = inject(Router);
    private readonly userService = inject(UserService);

    public readonly form: FormGroup;
    public sending = false;

    public constructor() {
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
