import {Component, Input} from '@angular/core';
import {MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig} from '@angular/material/legacy-dialog';
import {
    SelectAdminApprovedModalComponent,
    SelectAdminApprovedModalResult,
} from '../select-admin-approved-modal/select-admin-approved-modal.component';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {BookingPartialInput, BookingStatus, CurrentUserForProfile_viewer} from '../../generated-types';

@Component({
    selector: 'app-select-admin-approved-button',
    templateUrl: './select-admin-approved-button.component.html',
})
export class SelectAdminApprovedButtonComponent {
    @Input() public user!: CurrentUserForProfile_viewer;

    public constructor(private readonly dialog: MatDialog, private readonly bookingService: BookingService) {}

    public openDialog(): void {
        const options: MatDialogConfig = {
            width: '700px',
            minHeight: '70vh',
            maxHeight: '90vh',
        };

        this.dialog
            .open<SelectAdminApprovedModalComponent, void, SelectAdminApprovedModalResult>(
                SelectAdminApprovedModalComponent,
                options,
            )
            .afterClosed()
            .subscribe(bookables => {
                if (bookables) {
                    bookables.forEach(bookable => {
                        const booking: BookingPartialInput = {status: BookingStatus.application};
                        this.bookingService.createWithBookable(bookable, this.user, booking).subscribe();
                    });
                }
            });
    }
}
