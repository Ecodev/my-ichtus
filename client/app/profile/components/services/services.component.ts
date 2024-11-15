import {Component, DestroyRef, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Bookings, BookingType, CurrentUserForProfile} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {NaturalAlertService, NaturalAvatarComponent, NaturalDataSource, NaturalIconDirective} from '@ecodev/natural';
import {finalize} from 'rxjs/operators';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule, DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        NaturalIconDirective,
        NaturalAvatarComponent,
        RouterLink,
        MatTabsModule,
        RouterLinkActive,
        RouterOutlet,
    ],
})
export class ServicesComponent implements OnInit, OnChanges {
    private readonly userService = inject(UserService);
    public readonly route = inject(ActivatedRoute);
    private readonly alertService = inject(NaturalAlertService);
    private readonly bookingService = inject(BookingService);

    private readonly destroyRef = inject(DestroyRef);
    @Input({required: true}) public user!: NonNullable<CurrentUserForProfile['viewer']>;

    public adminMode = false;

    public runningServicesDS!: NaturalDataSource<Bookings['bookings']>;
    public pendingApplicationsDS!: NaturalDataSource<Bookings['bookings']>;

    public servicesColumns = ['name', 'initialPrice', 'periodicPrice', 'revoke'];
    public applicationsColumns = ['name', 'startDate', 'remarks', 'initialPrice', 'periodicPrice', 'cancel'];
    public readonly deleting = new Map<Bookings['bookings']['items'][0]['id'], true>();

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
            .pipe(takeUntilDestroyed(this.destroyRef));
        this.pendingApplicationsDS = new NaturalDataSource<Bookings['bookings']>(pendingApplications);

        const runningServices = this.userService
            .getRunningServices(this.user)
            .pipe(takeUntilDestroyed(this.destroyRef));
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
        return booking.bookable?.bookingType !== BookingType.Mandatory;
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
