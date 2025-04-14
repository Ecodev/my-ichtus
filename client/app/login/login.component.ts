import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ifValid} from '@ecodev/natural';
import {UserService} from '../admin/users/services/user.service';
import {finalize} from 'rxjs/operators';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        RouterLink,
        MatDividerModule,
    ],
})
export class LoginComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly userService = inject(UserService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly fb = inject(NonNullableFormBuilder);

    /**
     * Stores the received redirect URL until we need to use it (when login is successfull)
     */
    public returnUrl = '/';
    public readonly form = this.fb.group({
        login: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });
    public hidePassword = true;

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

    public maybeConfirm(): void {
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
