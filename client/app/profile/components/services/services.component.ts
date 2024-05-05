import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Bookings, BookingType, CurrentUserForProfile} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {
    NaturalAbstractController,
    NaturalAlertService,
    NaturalDataSource,
    NaturalIconDirective,
    NaturalAvatarComponent,
    NaturalEnumPipe,
} from '@ecodev/natural';
import {finalize, takeUntil} from 'rxjs/operators';

import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        NaturalIconDirective,
        NaturalAvatarComponent,
        RouterLink,
        MatTabsModule,
        RouterLinkActive,
        RouterOutlet,
        NaturalEnumPipe,
    ],
})
export class ServicesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {
    @Input({required: true}) public user!: NonNullable<CurrentUserForProfile['viewer']>;

    public adminMode = false;

    public runningServicesDS!: NaturalDataSource<Bookings['bookings']>;
    public pendingApplicationsDS!: NaturalDataSource<Bookings['bookings']>;

    public servicesColumns = ['name', 'initialPrice', 'periodicPrice', 'revoke'];
    public applicationsColumns = ['name', 'status', 'initialPrice', 'periodicPrice', 'cancel'];
    public readonly deleting = new Map<Bookings['bookings']['items'][0]['id'], true>();

    public constructor(
        private readonly userService: UserService,
        public readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        private readonly bookingService: BookingService,
    ) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges): void {
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

    public loadData(): void {
        const pendingApplications = this.userService
            .getPendingApplications(this.user)
            .pipe(takeUntil(this.ngUnsubscribe));
        this.pendingApplicationsDS = new NaturalDataSource<Bookings['bookings']>(pendingApplications);

        const runningServices = this.userService.getRunningServices(this.user).pipe(takeUntil(this.ngUnsubscribe));
        this.runningServicesDS = new NaturalDataSource<Bookings['bookings']>(runningServices);
    }

    /**
     * Set end date ?
     */
    public revokeBooking(booking: Bookings['bookings']['items'][0]): void {
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

    public canRevoke(booking: Bookings['bookings']['items'][0]): boolean {
        return booking.bookable?.bookingType !== BookingType.mandatory;
    }

    public cancelApplication(booking: Bookings['bookings']['items'][0]): void {
        this.deleting.set(booking.id, true);
        this.bookingService
            .delete([booking])
            .pipe(finalize(() => this.deleting.delete(booking.id)))
            .subscribe();
    }

    public unregister(): void {
        this.alertService
            .confirm('Démission', 'Veux-tu quitter le club Ichtus ?', 'Démissioner définitivement')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.userService.unregister(this.user).subscribe(() => {
                        // If viewer is the unregistered viewer, log him out.
                        if (this.route.snapshot.data.viewer.id === this.user.id) {
                            this.alertService.info('Tu as démissioné', 5000);
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
