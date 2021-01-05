import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {
    SelectAdminApprovedModalComponent,
    SelectAdminApprovedModalResult,
} from '../select-admin-approved-modal/select-admin-approved-modal.component';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {BookingPartialInput, BookingStatus, CurrentUserForProfile_viewer} from '../../generated-types';

@Component({
    selector: 'natural-select-admin-approved-button',
    templateUrl: './select-admin-approved-button.component.html',
})
export class SelectAdminApprovedButtonComponent implements OnInit {
    @Input() public user!: CurrentUserForProfile_viewer;

    constructor(private dialog: MatDialog, private bookingService: BookingService) {}

    public ngOnInit(): void {}

    public openDialog(): void {
        const options: MatDialogConfig = {
            minHeight: '450px',
            width: '700px',
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
                        this.bookingService.createWithBookable(bookable, this.user, booking).subscribe(() => {});
                    });
                }
            });
    }
}
