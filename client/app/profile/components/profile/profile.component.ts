import {Apollo} from 'apollo-angular';
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router, RouterLink, RouterOutlet} from '@angular/router';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {
    NaturalAlertService,
    NaturalAvatarComponent,
    NaturalEnumPipe,
    NaturalIconDirective,
    NaturalQueryVariablesManager,
    NaturalSidenavComponent,
    NaturalSidenavContainerComponent,
    NaturalSidenavContentComponent,
} from '@ecodev/natural';
import {UserService} from '../../../admin/users/services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent, ProvisionData} from '../provision/provision.component';
import {filter} from 'rxjs/operators';
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
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    imports: [
        NaturalSidenavContainerComponent,
        NaturalSidenavComponent,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NaturalIconDirective,
        CommonModule,
        NaturalSidenavContentComponent,
        NaturalAvatarComponent,
        MatTooltipModule,
        ParticleSwitchComponent,
        MoneyComponent,
        MatDividerModule,
        RouterOutlet,
        NaturalEnumPipe,
    ],
})
export class ProfileComponent implements OnInit {
    public readonly userService = inject(UserService);
    public readonly permissionsService = inject(PermissionsService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    public readonly bookableService = inject(BookableService);
    private readonly apollo = inject(Apollo);
    private readonly dialog = inject(MatDialog);
    private readonly datatransService = inject(DatatransService);
    private readonly licenseService = inject(LicenseService);

    private readonly destroyRef = inject(DestroyRef);
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public config = localConfig;
    public licenses: Licenses['licenses']['items'][0][] = [];

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer;

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
                takeUntilDestroyed(this.destroyRef),
                filter(event => event instanceof NavigationStart),
            )
            .subscribe(() => {
                this.datatransService.cleanup();
            });
    }

    public pay(): void {
        if (!this.viewer?.account) {
            return;
        }

        const config: MatDialogConfig<ProvisionData> = {
            data: {
                balance: Number(this.viewer.account.balance),
                user: this.viewer,
            },
            maxWidth: '650px',
        };

        this.dialog
            .open<ProvisionComponent, ProvisionData, number>(ProvisionComponent, config)
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
        if (!localConfig?.datatrans) {
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
