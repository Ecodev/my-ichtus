import {Component, inject, Input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {
    BookingPartialInput,
    Bookings,
    BookingSortingField,
    BookingsVariables,
    BookingType,
    CurrentUserForProfile,
    JoinType,
    LogicalOperator,
    SortingOrder,
    Users,
    UsersVariables,
} from '../../generated-types';
import {
    NaturalAlertService,
    NaturalAvatarComponent,
    NaturalIconDirective,
    NaturalQueryVariablesManager,
    WithId,
} from '@ecodev/natural';
import {DatePipe} from '@angular/common';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {CommentComponent} from './comment.component';
import {TextFieldModule} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ParticleEffectDirective} from '../particle-button/particle-effect.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {CardComponent} from '../card/card.component';

type Extended = {
    booking: Readonly<Bookings['bookings']['items'][0]>;
    showComments: boolean;
    terminated: boolean;
    explode: boolean;
};

type PaginatedExtendedBooking = {
    items: Extended[];
    readonly length: number;
};

function bookingsToExtended(bookings: Bookings['bookings']): PaginatedExtendedBooking {
    return {
        length: bookings.length,
        items: bookings.items.map(item => {
            return {
                booking: item,
                showComments: false,
                terminated: item.endDate != null,
                explode: false,
            };
        }),
    };
}

@Component({
    selector: 'app-navigations',
    templateUrl: './navigations.component.html',
    styleUrl: './navigations.component.scss',
    imports: [
        CardComponent,
        NaturalAvatarComponent,
        MatButtonModule,
        RouterLink,
        MatDividerModule,
        MatIconModule,
        NaturalIconDirective,
        ParticleEffectDirective,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        TextFieldModule,
        DatePipe,
    ],
})
export class NavigationsComponent implements OnInit {
    public readonly userService = inject(UserService);
    public readonly bookingService = inject(BookingService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly dialog = inject(MatDialog);
    private readonly snackbar = inject(MatSnackBar);

    @Input({required: true}) public user!: NonNullable<CurrentUserForProfile['viewer']>;
    @Input() public activeOnly = true;
    @Input() public showEmptyMessage = false;

    public bookings: PaginatedExtendedBooking | null = null;

    private bookingsQVM = new NaturalQueryVariablesManager<BookingsVariables>();

    private currentPage = 0;
    private family: (NonNullable<CurrentUserForProfile['viewer']> | Users['users']['items'][0])[] = [];

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

    protected animationEnd(event: AnimationEvent, item: Extended): void {
        if ((event.target as any).nodeName === 'APP-CARD') {
            item.terminated = true;
        }
    }

    public endBooking(item: Extended): void {
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
                                const partialBooking: WithId<BookingPartialInput> = {
                                    id: booking.id,
                                    endComment: comment,
                                };

                                this.bookingService.updateNow(partialBooking).subscribe(() => {
                                    this.alertService.info('Merci pour votre commentaire');
                                });
                            }
                        });
                });
        });
    }

    public update(partialBooking: WithId<BookingPartialInput>): void {
        this.bookingService.updateNow(partialBooking).subscribe();
    }

    public nextPage(): void {
        this.currentPage++;
        this.getNavigations(this.family).subscribe(bookings => {
            this.bookings?.items.push(...bookingsToExtended(bookings).items);
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
                                conditions: [{bookingType: {in: {values: [BookingType.SelfApproved]}}}],
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
