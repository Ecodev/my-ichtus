import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { BookingType } from '../../../shared/generated-types';
import { UserService } from '../../../admin/users/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { NaturalAbstractController, NaturalAlertService, NaturalDataSource } from '@ecodev/natural';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss'],
})
export class ServicesComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {

    @Input() user;

    public adminMode = false;

    public BookableService = BookableService;
    public runningServicesDS: NaturalDataSource;
    public pendingApplicationsDS: NaturalDataSource;

    public servicesColumns = ['name', 'periodicPrice', 'revoke'];
    public applicationsColumns = ['name', 'status', 'initialPrice', 'periodicPrice', 'cancel'];

    constructor(private userService: UserService,
                private route: ActivatedRoute,
                private alertService: NaturalAlertService,
                private bookingService: BookingService) {
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

    public loadData() {
        const pendingApplications = this.userService.getPendingApplications(this.user, this.ngUnsubscribe);
        this.pendingApplicationsDS = new NaturalDataSource(pendingApplications);

        const runningServices = this.userService.getRunningServices(this.user, this.ngUnsubscribe);
        this.runningServicesDS = new NaturalDataSource(runningServices);
    }

    /**
     * Set end date ?
     */
    public revokeBooking(booking) {
        this.alertService
            .confirm('Résiliation de prestation', 'Voulez-vous résilier définitivement cette prestation ?', 'Confirmer la résiliation')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.bookingService.terminateBooking(booking.id);
                }
            });
    }

    public canRevoke(booking): boolean {
        return booking.bookable.bookingType !== BookingType.mandatory;
    }

    public cancelApplication(booking) {
        this.bookingService.delete([booking]).subscribe();
    }

    public unregister(): void {
        this.alertService.confirm('Démission', 'Voulez-vous quitter le club Ichtus ?', 'Démissioner définitivement')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.userService.unregister(this.user).subscribe(() => {
                        // If viewer is the unregistered viewer, log him out.
                        if (this.route.snapshot.data.viewer.model.id === this.user.id) {
                            this.alertService.info('Vous avez démissioné', 5000);
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
