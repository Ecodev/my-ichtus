import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalAbstractController } from '@ecodev/natural';
import { UserService } from '../admin/users/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends NaturalAbstractController implements OnInit, OnDestroy {

    public loading = false;

    /**
     * Stores the received redirect URL until we need to use it (when login is successfull)
     */
    public returnUrl: string;

    public loginForm = {
        login: '',
        password: '',
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        public alertService: NaturalAlertService,
        public snackBar: MatSnackBar,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        const logout = this.route.snapshot.queryParams['logout'] || false;

        // Attempt to skip login if user is already logged in (but not if is trying to logout)
        if (!logout) {
            if (this.route.snapshot.data.viewer.model) {
                this.redirect();
            }
        }
    }

    /**
     * Send mutation to log the user and redirect to home.
     */
    public login(): void {
        this.snackBar.dismiss();
        this.loading = true;

        this.userService.login(this.loginForm)
            .pipe(finalize(() => this.loading = false))
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
