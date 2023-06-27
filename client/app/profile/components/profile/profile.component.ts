import {Apollo} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router, RouterLink, RouterOutlet} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {
    NaturalAbstractController,
    NaturalAlertService,
    NaturalQueryVariablesManager,
    NaturalSidenavContainerComponent,
    NaturalSidenavComponent,
    NaturalIconDirective,
    NaturalSidenavContentComponent,
    NaturalAvatarComponent,
    NaturalCapitalizePipe,
    NaturalEnumPipe,
} from '@ecodev/natural';
import {UserService} from '../../../admin/users/services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../provision/provision.component';
import {filter, takeUntil} from 'rxjs/operators';
import {CurrentUserForProfile, Licenses, LicensesVariables} from '../../../shared/generated-types';
import {DatatransService} from '../../../shared/services/datatrans.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {LicenseService} from '../../../admin/licenses/services/license.service';
import {localConfig} from '../../../shared/generated-config';
import {Big} from 'big.js';
import {MatDividerModule} from '@angular/material/divider';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {ParticleSwitchComponent} from '../../../shared/components/particle-switch/particle-switch.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgIf, NgFor, AsyncPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: true,
    imports: [
        NaturalSidenavContainerComponent,
        FlexModule,
        NaturalSidenavComponent,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NaturalIconDirective,
        NgIf,
        NaturalSidenavContentComponent,
        NaturalAvatarComponent,
        NgFor,
        MatTooltipModule,
        ParticleSwitchComponent,
        MoneyComponent,
        MatDividerModule,
        RouterOutlet,
        AsyncPipe,
        NaturalCapitalizePipe,
        NaturalEnumPipe,
    ],
})
export class ProfileComponent extends NaturalAbstractController implements OnInit {
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public config = localConfig;
    public licenses: Licenses['licenses']['items'][0][] = [];

    public constructor(
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

    private doPayment(user: NonNullable<CurrentUserForProfile['viewer']>, amount: number): void {
        if (!localConfig || !localConfig.datatrans) {
            return;
        }

        // Convert the decimal amount in cents
        const roundedAmount = Big(amount).times(100).toFixed(0);

        const sign = this.datatransService.getHexaSHA256Signature(
            '',
            localConfig.datatrans.key,
            localConfig.datatrans.merchantId,
            roundedAmount,
            'CHF',
            user.id,
        );

        this.datatransService.startPayment({
            params: {
                production: localConfig.datatrans.production,
                merchantId: localConfig.datatrans.merchantId,
                sign: sign,
                refno: user.id,
                amount: roundedAmount,
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
