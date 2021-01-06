import {Apollo} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {NaturalAbstractController, NaturalAlertService} from '@ecodev/natural';
import {UserService} from '../../../admin/users/services/user.service';
import * as Datatrans from '../../../datatrans-2.0.0-ecodev.js';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../provision/provision.component';
import {ConfigService, FrontEndConfig} from '../../../shared/services/config.service';
import {filter, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends NaturalAbstractController implements OnInit {
    public viewer;

    /**
     * Install FE config
     */
    public config: FrontEndConfig | null = null;

    constructor(
        public userService: UserService,
        private alertService: NaturalAlertService,
        private route: ActivatedRoute,
        private router: Router,
        public bookableService: BookableService,
        private apollo: Apollo,
        private dialog: MatDialog,
        configService: ConfigService,
    ) {
        super();
        configService.config.subscribe(config => {
            this.config = config;
        });
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;

        // Clean up datatrans on any route change
        this.router.events
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(event => event instanceof NavigationStart),
            )
            .subscribe(() => {
                Datatrans.cleanup();
            });
    }

    public pay(): void {
        if (!this.viewer || !this.viewer.account) {
            return;
        }

        const config: MatDialogConfig = {
            data: {
                balance: Number(this.viewer.account.balance),
                user: this.viewer,
            },
            maxWidth: '650px',
        };

        this.dialog
            .open(ProvisionComponent, config)
            .afterClosed()
            .subscribe(amount => {
                if (amount) {
                    this.doPayment(this.viewer, amount);
                }
            });
    }

    public canAccessServices(): boolean {
        return UserService.canAccessServices(this.viewer);
    }

    private doPayment(user, amount): void {
        if (!this.config) {
            return;
        }

        const sign = Datatrans.getHexaSHA256Signature(
            '',
            this.config.datatrans.key,
            this.config.datatrans.merchantId,
            amount * 100,
            'CHF',
            user.id,
        );

        Datatrans.startPayment({
            params: {
                production: this.config.datatrans.production,
                merchantId: this.config.datatrans.merchantId,
                sign: sign,
                refno: user.id,
                amount: amount * 100,
                currency: 'CHF',
                endpoint: this.config.datatrans.endpoint,
            },
            success: () => {
                this.alertService.info('Paiement réussi');
                // Request user to update account.
                // Don't call accountService as actual user may not have one, and it couldn't be updated.
                // TODO : replace by a viewer watching architecture
                this.userService.getOne(user.id).subscribe(updatedUser => {
                    this.viewer.account = updatedUser.account;
                });

                // Restore store, to refetch queries that are watched
                // this.apollo.client.resetStore();
                this.apollo.client.reFetchObservableQueries(false);
            },
            error: data => {
                this.alertService.error("Le paiement n'a pas abouti: " + data.message);
            },
            cancel: () => {
                this.alertService.error('Le paiement a été annulé');
            },
        });
    }
}
