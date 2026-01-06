import {ifValid, NaturalErrorMessagePipe} from '@ecodev/natural';
import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../admin/users/services/user.service';
import {finalize} from 'rxjs/operators';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';

export const privacyPolicyUrl = 'https://ichtus.ch/contact/politique-de-confidentialite/';
@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatSuffix,
        MatInput,
        MatButton,
        MatIconButton,
        MatIcon,
        RouterLink,
        MatDivider,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly userService = inject(UserService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly fb = inject(NonNullableFormBuilder);
    protected readonly privacyPolicyUrl = privacyPolicyUrl;

    /**
     * Stores the received redirect URL until we need to use it (when login is successfull)
     */
    protected returnUrl = '/';
    protected readonly form = this.fb.group({
        login: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });
    protected hidePassword = true;

    public ngOnInit(): void {
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
        const logout = this.route.snapshot.queryParams.logout || false;

        // Attempt to skip login if user is already logged in (but not if is trying to logout)
        if (!logout) {
            if (this.route.snapshot.data.viewer) {
                this.redirect();
            }
        }
    }

    protected maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.login());
    }

    /**
     * Send mutation to log the user and redirect to home.
     */
    private login(): void {
        this.snackBar.dismiss();
        this.form.disable();
        this.hidePassword = true;

        this.userService
            .login(this.form.getRawValue())
            .pipe(finalize(() => this.form.enable()))
            .subscribe(() => {
                this.redirect();
            });
    }

    /**
     * Redirect to home or redirect URL from GET params
     */
    private redirect(): void {
        this.router.navigateByUrl(this.returnUrl || '/');
    }
}
