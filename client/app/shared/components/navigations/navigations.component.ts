import {Component, inject, input, OnInit} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {
    BookingPartialInput,
    BookingSortingField,
    BookingsQuery,
    BookingsQueryVariables,
    BookingType,
    CurrentUserForProfileQuery,
    JoinType,
    LogicalOperator,
    SortingOrder,
    UsersQuery,
    UsersQueryVariables,
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
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {ParticleEffectDirective} from '../particle-button/particle-effect.directive';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {RouterLink} from '@angular/router';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {CardComponent} from '../card/card.component';

type Extended = {
    booking: Readonly<BookingsQuery['bookings']['items'][0]>;
    showComments: boolean;
    terminated: boolean;
    explode: boolean;
};

type PaginatedExtendedBooking = {
    items: Extended[];
    readonly length: number;
};

function bookingsToExtended(bookings: BookingsQuery['bookings']): PaginatedExtendedBooking {
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
    imports: [
        CardComponent,
        NaturalAvatarComponent,
        MatButton,
        MatIconButton,
        RouterLink,
        MatDivider,
        MatIcon,
        NaturalIconDirective,
        ParticleEffectDirective,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        CdkTextareaAutosize,
        DatePipe,
        MatMiniFabButton,
    ],
    templateUrl: './navigations.component.html',
    styleUrl: './navigations.component.scss',
})
export class NavigationsComponent implements OnInit {
    protected readonly userService = inject(UserService);
    protected readonly bookingService = inject(BookingService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly dialog = inject(MatDialog);
    private readonly snackbar = inject(MatSnackBar);

    public readonly user = input.required<NonNullable<CurrentUserForProfileQuery['viewer']>>();
    public readonly activeOnly = input(true);
    public readonly showEmptyMessage = input(false);

    protected bookings: PaginatedExtendedBooking | null = null;

    private bookingsQVM = new NaturalQueryVariablesManager<BookingsQueryVariables>();

    private currentPage = 0;
    private family: (NonNullable<CurrentUserForProfileQuery['viewer']> | UsersQuery['users']['items'][0])[] = [];

    public ngOnInit(): void {
        const qvm = new NaturalQueryVariablesManager<UsersQueryVariables>();
        const user = this.user();
        qvm.set('variables', {
            filter: {
                groups: [{conditions: [{owner: {equal: {value: user.owner ? user.owner.id : user.id}}}]}],
            },
        });
        this.userService.getAll(qvm).subscribe(family => {
            this.family = [this.user(), ...family.items];
            this.getNavigations(this.family).subscribe(bookings => (this.bookings = bookingsToExtended(bookings)));
        });
    }

    protected animationEnd(event: AnimationEvent, item: Extended): void {
        if ((event.target as any).nodeName === 'APP-CARD') {
            item.terminated = true;
        }
    }

    protected endBooking(item: Extended): void {
        const snackbarOptions: MatSnackBarConfig = {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 6000,
        };

        const booking = item.booking;
        this.bookingService.terminateBooking(booking.id).subscribe(() => {
            item.explode = true;
            this.snackbar
                .open('La sortie est terminée', 'Faire un commentaire', snackbarOptions)
                .onAction()
                .subscribe(() => {
                    this.dialog
                        .open(CommentComponent)
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

    protected update(partialBooking: WithId<BookingPartialInput>): void {
        this.bookingService.updateNow(partialBooking).subscribe();
    }

    protected nextPage(): void {
        this.currentPage++;
        this.getNavigations(this.family).subscribe(bookings => {
            this.bookings?.items.push(...bookingsToExtended(bookings).items);
        });
    }

    private getNavigations(users: UsersQuery['users']['items']): Observable<BookingsQuery['bookings']> {
        const owner = {in: {values: users.map(u => u.id)}};
        const endDate = this.activeOnly() ? {null: {}} : null;

        const variables: BookingsQueryVariables = {
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
