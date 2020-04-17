import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../admin/users/services/user.service';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { animate, style, transition, trigger } from '@angular/animations';
import {
    BookingPartialInput,
    Bookings,
    BookingSortingField,
    BookingsVariables,
    BookingType,
    JoinType,
    LogicalOperator,
    SortingOrder,
    Users,
    UsersVariables,
} from '../../generated-types';
import { NaturalQueryVariablesManager } from '@ecodev/natural';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CommentComponent } from './comment.component';
import { NaturalAbstractController } from '@ecodev/natural';
import { NaturalAlertService } from '@ecodev/natural';

@Component({
    selector: 'app-navigations',
    templateUrl: './navigations.component.html',
    styleUrls: ['./navigations.component.scss'],
    animations: [
        trigger('terminate', [
            transition(':leave', [
                animate('0.2s ease-in-out', style({transform: 'scale(0, 0)'})),
            ]),
        ]),
    ],
})
export class NavigationsComponent extends NaturalAbstractController implements OnInit {

    @Input() user;
    @Input() activeOnly = true;
    @Input() showEmptyMessage = false;

    public bookings: Bookings['bookings'];

    private bookingsQVM = new NaturalQueryVariablesManager<BookingsVariables>();

    private currentPage = 0;
    private family;

    constructor(public userService: UserService,
                public bookingService: BookingService,
                private alertService: NaturalAlertService,
                private dialog: MatDialog,
                private snackbar: MatSnackBar) {
        super();
    }

    public ngOnInit(): void {

        const qvm = new NaturalQueryVariablesManager<UsersVariables>();
        qvm.set('variables', {
            filter: {groups: [{conditions: [{owner: {equal: {value: this.user.owner ? this.user.owner.id : this.user.id}}}]}]},
        });
        this.userService.getAll(qvm).subscribe(family => {
            this.family = [this.user, ...family.items];
            this.getNavigations(this.family).subscribe(bookings => this.bookings = bookings);
        });

    }

    public endBooking(booking) {

        const snackbarOptions: MatSnackBarConfig = {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 6000,
        };

        const modalOptions = {
            data: {
                title: 'Commentaire de fin de sortie',
                message: '',
                cancelText: 'Annuler',
                confirmText: 'Valider',
            },
        };

        this.bookingService.terminateBooking(booking.id).subscribe(() => {
            booking.endDate = new Date();
            this.snackbar.open('La sortie est terminée', 'Faire un commentaire', snackbarOptions).onAction().subscribe(() => {

                this.dialog.open(CommentComponent, modalOptions).afterClosed().subscribe(comment => {
                    if (comment && comment !== '') {
                        booking.endComment = comment;
                        const partialBooking = {id: booking.id, endComment: comment} as BookingPartialInput;
                        this.bookingService.updatePartially(partialBooking).subscribe((res) => {
                            this.alertService.info('Merci pour votre commentaire');
                        });
                    }

                });
            });
        });
    }

    public update(partialBooking) {
        this.bookingService.updatePartially(partialBooking).subscribe(() => {
        });
    }

    public nextPage() {
        this.currentPage++;
        this.getNavigations(this.family).subscribe(bookings => {
            this.bookings.items.push(...bookings.items);
        });
    }

    private getNavigations(users: Users['users']['items']): Observable<Bookings['bookings']> {

        const owner = {in: {values: users.map(u => u.id)}};
        const endDate = this.activeOnly ? {null: {}} : null;

        const variables: BookingsVariables = {
            filter: {
                groups: [
                    {
                        conditions: [{owner: owner, endDate: endDate}],
                        joins: {
                            bookable: {
                                type: JoinType.leftJoin,
                                conditions: [{bookingType: {in: {values: [BookingType.self_approved]}}}],
                            },
                        },
                    },
                    {
                        groupLogic: LogicalOperator.OR,
                        conditions: [{owner: owner, endDate: endDate, bookable: {empty: {}}}],
                    },
                ],
            },
            sorting: [
                {
                    field: BookingSortingField.endDate,
                    order: SortingOrder.DESC,
                    nullAsHighest: true,
                },
                {
                    field: BookingSortingField.startDate,
                    order: SortingOrder.DESC,
                },
            ],
        };

        this.bookingsQVM.set('variables', variables);
        this.bookingsQVM.set('pagination', {
            pagination: {
                pageSize: 10,
                pageIndex: this.currentPage,
            },
        });

        return this.bookingService.getAll(this.bookingsQVM);
    }

}
