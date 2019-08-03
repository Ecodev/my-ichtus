import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkActivityService } from '../shared/services/network-activity.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NaturalAlertService } from '@ecodev/natural';
import { NaturalAbstractController } from '@ecodev/natural';
import { UserService } from '../admin/users/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [
        trigger('headerState', [
            state('default', style({transform: 'translateY(0%)'})),
            state('loading', style({transform: 'translateY(-100%)'})),
            transition('* => *', [
                animate('500ms ease-in-out'),
            ]),
        ]),
    ],
})
export class LoginComponent extends NaturalAbstractController implements OnInit, OnDestroy {

    public loading = false;

    public status = 'default';

    /**
     * Stores the received redirect URL until we need to use it (when login is successfull)
     */
    public returnUrl: string;

    public loginForm = {
        login: '',
        password: '',
    };

    constructor(private route: ActivatedRoute,
                private router: Router,
                private userService: UserService,
                private network: NetworkActivityService,
                public alertService: NaturalAlertService,
                public snackBar: MatSnackBar) {
        super();
    }

    ngOnInit(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        const logout = this.route.snapshot.queryParams['logout'] || false;

        // Attempt to skip login if user is already logged in (but not if is trying to logout)
        if (!logout) {
            if (this.route.snapshot.data.viewer.model) {
                this.redirect();
            }
        }

        // Watch errors
        this.network.errors.subscribe(errors => {
            if (errors.length) {
                this.loading = false;
                this.status = 'default';
                this.alertService.error(errors[0].message, 5000);
            }
        });
    }

    /**
     * Send mutation to log the user and redirect to home.
     */
    public login(): void {
        this.snackBar.dismiss();
        this.loading = true;
        this.status = 'loading';
        this.userService.login(this.loginForm)
            .subscribe(() => {
                this.redirect();
                this.loading = false;
            }, () => this.loading = false);
    }

    /**
     * Redirect to home or redirect URL from GET params
     */
    private redirect(): void {
        this.router.navigateByUrl(this.returnUrl || '/');
    }

}
