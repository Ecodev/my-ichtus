import {Component, DestroyRef, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BookingType, CurrentUserForProfileQuery, PricedBookingsQuery} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {
    NaturalAlertService,
    NaturalAvatarComponent,
    NaturalDataSource,
    NaturalIconDirective,
    TypedMatCellDef,
} from '@ecodev/natural';
import {finalize} from 'rxjs/operators';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';
import {MatIcon} from '@angular/material/icon';
import {
    MatCell,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatFooterRow,
    MatFooterRowDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-services',
    imports: [
        CurrencyPipe,
        DatePipe,
        MatButton,
        MatIconButton,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatFooterRowDef,
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        MatHeaderRow,
        MatRow,
        MatFooterRow,
        MatIcon,
        NaturalIconDirective,
        NaturalAvatarComponent,
        RouterLink,
        MatTabNav,
        MatTabNavPanel,
        MatTabLink,
        RouterLinkActive,
        RouterOutlet,
    ],
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss',
})
export class ServicesComponent implements OnInit, OnChanges {
    protected readonly userService = inject(UserService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly alertService = inject(NaturalAlertService);
    protected readonly bookingService = inject(BookingService);
    protected readonly destroyRef = inject(DestroyRef);

    @Input({required: true}) public user!: NonNullable<CurrentUserForProfileQuery['viewer']>;

    protected adminMode = false;

    protected runningServicesDS!: NaturalDataSource<PricedBookingsQuery['bookings']>;
    protected pendingApplicationsDS!: NaturalDataSource<PricedBookingsQuery['bookings']>;

    protected servicesColumns = ['name', 'initialPrice', 'periodicPrice', 'revoke'];
    protected applicationsColumns = ['name', 'startDate', 'remarks', 'initialPrice', 'periodicPrice', 'cancel'];
    protected readonly deleting = new Map<PricedBookingsQuery['bookings']['items'][0]['id'], true>();

    public ngOnChanges(changes: SimpleChanges<this>): void {
        const previousUser = changes.user?.previousValue;
        if (previousUser && previousUser.id !== this.user.id) {
            this.loadData();
        }
    }

    public ngOnInit(): void {
        if (!this.user) {
            this.user = this.route.snapshot.data.viewer;
        } else {
            this.adminMode = true;
            this.applicationsColumns.push('admin');
            this.servicesColumns.push('usage');
            this.servicesColumns.push('admin');
        }

        this.loadData();
    }

    protected loadData(): void {
        const pendingApplications = this.userService
            .getPendingApplications(this.user)
            .pipe(takeUntilDestroyed(this.destroyRef));
        this.pendingApplicationsDS = new NaturalDataSource<PricedBookingsQuery['bookings']>(pendingApplications);

        const runningServices = this.userService
            .getRunningServices(this.user)
            .pipe(takeUntilDestroyed(this.destroyRef));
        this.runningServicesDS = new NaturalDataSource<PricedBookingsQuery['bookings']>(runningServices);
    }

    /**
     * Set end date ?
     */
    protected revokeBooking(booking: PricedBookingsQuery['bookings']['items'][0]): void {
        this.alertService
            .confirm(
                'Résiliation de prestation',
                'Veux-tu résilier définitivement cette prestation ?',
                'Confirmer la résiliation',
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    this.bookingService.terminateBooking(booking.id);
                }
            });
    }

    protected canRevoke(booking: PricedBookingsQuery['bookings']['items'][0]): boolean {
        return booking.bookable?.bookingType !== BookingType.Mandatory;
    }

    protected cancelApplication(booking: PricedBookingsQuery['bookings']['items'][0]): void {
        this.deleting.set(booking.id, true);
        this.bookingService
            .delete([booking])
            .pipe(finalize(() => this.deleting.delete(booking.id)))
            .subscribe();
    }

    protected unregister(): void {
        this.alertService
            .confirm('Démission', 'Veux-tu quitter le club Ichtus ?', 'Démissionner définitivement')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.userService.unregister(this.user).subscribe(() => {
                        // If viewer is the unregistered viewer, log him out.
                        if (this.route.snapshot.data.viewer.id === this.user.id) {
                            this.alertService.info('Tu as démissionné', 5000);
                            this.userService.logout();
                        } else {
                            // If viewer is different (e.g Admin), don't log out
                            this.alertService.info('La démission a été prise en compte', 4000);
                        }
                    });
                }
            });
    }
}
