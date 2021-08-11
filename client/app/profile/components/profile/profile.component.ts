import {Apollo} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {NaturalAbstractController, NaturalAlertService, NaturalQueryVariablesManager} from '@ecodev/natural';
import {UserService} from '../../../admin/users/services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../provision/provision.component';
import {filter, takeUntil} from 'rxjs/operators';
import {
    CurrentUserForProfile_viewer,
    Licenses_licenses_items,
    LicensesVariables,
    LicenseVariables,
} from '../../../shared/generated-types';
import {DatatransService} from '../../../shared/services/datatrans.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {LicenseService} from '../../../admin/licenses/services/license.service';
import {localConfig} from '../../../shared/generated-config';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends NaturalAbstractController implements OnInit {
    public viewer!: CurrentUserForProfile_viewer;
    public config = localConfig;
    public licenses: Licenses_licenses_items[] = [];

    constructor(
        public readonly userService: UserService,
        public readonly permissionsService: PermissionsService,
        private readonly alertService: NaturalAlertService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        public readonly bookableService: BookableService,
        private readonly apollo: Apollo,
        private readonly dialog: MatDialog,
        private readonly datatransService: DatatransService,
        private readonly licenseService: LicenseService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;

        const licenseQueryVariables = new NaturalQueryVariablesManager<LicensesVariables>();
        licenseQueryVariables.set('variables', {
            filter: {
                groups: [{conditions: [{users: {have: {values: [this.viewer.id]}}}]}],
            },
        });

        this.licenseService.getAll(licenseQueryVariables).subscribe(result => {
            this.licenses = result.items;
        });

        // Clean up datatrans on any route change
        this.router.events
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(event => event instanceof NavigationStart),
            )
            .subscribe(() => {
                this.datatransService.cleanup();
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
            .open<ProvisionComponent, void, number>(ProvisionComponent, config)
            .afterClosed()
            .subscribe(amount => {
                if (amount) {
                    this.doPayment(this.viewer, amount);
                }
            });
    }

    public canAccessServices(): boolean {
        return this.permissionsService.canAccessServices(this.viewer);
    }

    private doPayment(user: CurrentUserForProfile_viewer, amount: number): void {
        if (!localConfig || !localConfig.datatrans) {
            return;
        }

        const sign = this.datatransService.getHexaSHA256Signature(
            '',
            localConfig.datatrans.key,
            localConfig.datatrans.merchantId,
            amount * 100,
            'CHF',
            user.id,
        );

        this.datatransService.startPayment({
            params: {
                production: localConfig.datatrans.production,
                merchantId: localConfig.datatrans.merchantId,
                sign: sign,
                refno: user.id,
                amount: amount * 100,
                currency: 'CHF',
                endpoint: localConfig.datatrans.endpoint,
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
            error: (data: {message: string}) => {
                this.alertService.error("Le paiement n'a pas abouti: " + data.message);
            },
            cancel: () => {
                this.alertService.error('Le paiement a été annulé');
            },
        });
    }
}
