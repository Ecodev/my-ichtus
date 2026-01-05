import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatListItem, MatNavList} from '@angular/material/list';
import {ServicesComponent} from '../../services/services.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NaturalDataSource, NaturalIconDirective} from '@ecodev/natural';
import {BookingsQuery, BookingType, PricedBookingsQuery} from '../../../../shared/generated-types';
import {NgTemplateOutlet} from '@angular/common';
import {UserContactDataComponent} from '../../../../shared/components/user-contact-data/user-contact-data.component';
import {BookablePriceComponent} from '../../../../shared/components/bookable-price/bookable-price.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
    selector: 'app-formation',
    imports: [
        RouterLink,
        MatListItem,
        MatNavList,
        RouterLinkActive,
        RouterOutlet,
        NgTemplateOutlet,
        UserContactDataComponent,
        BookablePriceComponent,
        MatIcon,
        NaturalIconDirective,
        MatButton,
    ],
    templateUrl: './formation.component.html',
    styleUrl: './formation.component.scss',
})
export class FormationComponent extends ServicesComponent {
    public override loadData(): void {
        const runningFormations = this.userService
            .getRunningServices(this.user, true)
            .pipe(takeUntilDestroyed(this.destroyRef));
        this.runningServicesDS = new NaturalDataSource<PricedBookingsQuery['bookings']>(runningFormations);

        const pendingFormationApplications = this.userService
            .getPendingApplications(this.user, [BookingType.AdminApproved])
            .pipe(takeUntilDestroyed(this.destroyRef));
        this.pendingApplicationsDS = new NaturalDataSource<PricedBookingsQuery['bookings']>(
            pendingFormationApplications,
        );
    }

    public override revokeBooking(booking: BookingsQuery['bookings']['items'][0]): void {
        this.alertService
            .confirm(
                'Se désinscrire',
                "Veux-tu te désinscrire définitivement de ce cours ? Le montant ne sera remboursé qu'en cas de force majeure (maladie, accident) ou d'annulation au plus tard 10 jours avant le cours.",
                'Confirmer la désinscription',
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    this.bookingService.terminateBooking(booking.id);
                }
            });
    }
}
