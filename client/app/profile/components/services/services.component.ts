import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {
    Bookings_bookings,
    Bookings_bookings_items,
    BookingType,
    CurrentUserForProfile_viewer,
} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {NaturalAbstractController, NaturalAlertService, NaturalDataSource} from '@ecodev/natural';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss'],
})
export class ServicesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {
    @Input() public user!: CurrentUserForProfile_viewer;

    public adminMode = false;

    public runningServicesDS!: NaturalDataSource<Bookings_bookings>;
    public pendingApplicationsDS!: NaturalDataSource<Bookings_bookings>;

    public servicesColumns = ['name', 'initialPrice', 'periodicPrice', 'revoke'];
    public applicationsColumns = ['name', 'status', 'initialPrice', 'periodicPrice', 'cancel'];

    constructor(
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        private readonly bookingService: BookingService,
    ) {
        super();
    }

    public ngOnInit(): void {
        if (!this.user) {
            this.user = this.route.snapshot.data.viewer.model;
        } else {
            this.adminMode = true;
            this.applicationsColumns.push('admin');
            this.servicesColumns.push('usage');
            this.servicesColumns.push('admin');
        }

        this.loadData();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const previousUser = changes.user.previousValue;
        if (previousUser && previousUser.id !== this.user.id) {
            this.loadData();
        }
    }

    public loadData(): void {
        const pendingApplications = this.userService
            .getPendingApplications(this.user)
            .pipe(takeUntil(this.ngUnsubscribe));
        this.pendingApplicationsDS = new NaturalDataSource<Bookings_bookings>(pendingApplications);

        const runningServices = this.userService.getRunningServices(this.user).pipe(takeUntil(this.ngUnsubscribe));
        this.runningServicesDS = new NaturalDataSource<Bookings_bookings>(runningServices);
    }

    /**
     * Set end date ?
     */
    public revokeBooking(booking: Bookings_bookings_items): void {
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

    public canRevoke(booking: Bookings_bookings_items): boolean {
        return booking.bookable?.bookingType !== BookingType.mandatory;
    }

    public cancelApplication(booking: Bookings_bookings_items): void {
        this.bookingService.delete([booking]).subscribe();
    }

    public unregister(): void {
        this.alertService
            .confirm('Démission', 'Veux-tu quitter le club Ichtus ?', 'Démissioner définitivement')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.userService.unregister(this.user).subscribe(() => {
                        // If viewer is the unregistered viewer, log him out.
                        if (this.route.snapshot.data.viewer.model.id === this.user.id) {
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
