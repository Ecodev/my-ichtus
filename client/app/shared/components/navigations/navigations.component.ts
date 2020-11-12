import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {
    BookingPartialInput,
    Bookings,
    Bookings_bookings_items,
    BookingSortingField,
    BookingsVariables,
    BookingType,
    JoinType,
    LogicalOperator,
    SortingOrder,
    Users,
    UsersVariables,
} from '../../generated-types';
import {
    NaturalAbstractController,
    NaturalAlertService,
    NaturalQueryVariablesManager,
    PaginatedData,
} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {CommentComponent} from './comment.component';

type Extented = {
    booking: Bookings_bookings_items;
    showComments: boolean;
    terminated: boolean;
    explode: boolean;
};

function bookingsToExtended(bookings: Bookings['bookings']): PaginatedData<Extented> {
    return {
        ...bookings,
        items: bookings.items.map(item => {
            return {
                booking: item,
                showComments: false,
                terminated: false,
                explode: false,
            };
        }),
    };
}

@Component({
    selector: 'app-navigations',
    templateUrl: './navigations.component.html',
    styleUrls: ['./navigations.component.scss'],
    animations: [
        trigger('terminate', [transition(':leave', [animate('0.2s ease-in-out', style({transform: 'scale(0, 0)'}))])]),
    ],
})
export class NavigationsComponent extends NaturalAbstractController implements OnInit {
    @Input() public user;
    @Input() public activeOnly = true;
    @Input() public showEmptyMessage = false;

    public bookings: PaginatedData<Extented>;

    private bookingsQVM = new NaturalQueryVariablesManager<BookingsVariables>();

    private currentPage = 0;
    private family;

    constructor(
        public userService: UserService,
        public bookingService: BookingService,
        private alertService: NaturalAlertService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
    ) {
        super();
    }

    public ngOnInit(): void {
        const qvm = new NaturalQueryVariablesManager<UsersVariables>();
        qvm.set('variables', {
            filter: {
                groups: [
                    {conditions: [{owner: {equal: {value: this.user.owner ? this.user.owner.id : this.user.id}}}]},
                ],
            },
        });
        this.userService.getAll(qvm).subscribe(family => {
            this.family = [this.user, ...family.items];
            this.getNavigations(this.family).subscribe(bookings => (this.bookings = bookingsToExtended(bookings)));
        });
    }

    public endBooking(item: Extented) {
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

        const booking = item.booking;
        this.bookingService.terminateBooking(booking.id).subscribe(() => {
            item.explode = true;
            this.snackbar
                .open('La sortie est terminée', 'Faire un commentaire', snackbarOptions)
                .onAction()
                .subscribe(() => {
                    this.dialog
                        .open(CommentComponent, modalOptions)
                        .afterClosed()
                        .subscribe(comment => {
                            if (comment && comment !== '') {
                                const partialBooking: BookingPartialInput & {id: string} = {
                                    id: booking.id,
                                    endComment: comment,
                                };

                                this.bookingService.updatePartially(partialBooking).subscribe(() => {
                                    this.alertService.info('Merci pour votre commentaire');
                                });
                            }
                        });
                });
        });
    }

    public update(partialBooking) {
        this.bookingService.updatePartially(partialBooking).subscribe(() => {});
    }

    public nextPage() {
        this.currentPage++;
        this.getNavigations(this.family).subscribe(bookings => {
            this.bookings.items.push(...bookingsToExtended(bookings).items);
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
