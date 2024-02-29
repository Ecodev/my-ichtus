import {Inject, Injectable} from '@angular/core';
import {Button, copyToClipboard, NaturalQueryVariablesManager} from '@ecodev/natural';
import {
    BookingsWithOwnerContact,
    BookingsWithOwnerContactVariables,
    EmailAndPhoneUsers,
    EmailAndPhoneUsersVariables,
    UserContactData,
} from '../../generated-types';
import {Apollo} from 'apollo-angular';
import {DocumentNode} from 'graphql';
import {emailAndPhoneUsersQuery} from '../../../admin/users/services/user.queries';
import {bookingsWithOwnerContactQuery} from '../../../admin/bookings/services/booking.queries';
import {DOCUMENT} from '@angular/common';

export type ContactType = 'bookingsWithOwnerContact' | 'emailAndPhoneUsers';

@Injectable({
    providedIn: 'root',
})
export class CopyContactDataButtonService<V extends EmailAndPhoneUsersVariables | BookingsWithOwnerContactVariables> {
    private type!: ContactType;
    private variablesManager!: NaturalQueryVariablesManager<V>;
    private usersEmail: string | null = null;
    private usersEmailAndName: string | null = null;
    private usersPhoneAndName: string | null = null;

    public constructor(
        private readonly apollo: Apollo,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {}

    public getButtons(variablesManager: NaturalQueryVariablesManager<V>, type: ContactType): Button[] {
        this.variablesManager = variablesManager;
        this.type = type;
        this.usersEmail = null;
        this.usersEmailAndName = null;
        this.usersPhoneAndName = null;

        return [
            {
                label: 'Copier les ...',
                icon: 'email',
                click: (button: Button): void => this.downloadData(button),
                buttons: [
                    {
                        label: 'e-mails',
                        disabled: true,
                        click: (): void => this.copyToClipboard(this.usersEmail),
                    },
                    {
                        label: 'e-mails et les noms',
                        disabled: true,
                        click: (): void => this.copyToClipboard(this.usersEmailAndName),
                    },
                    {
                        label: 'n° de tél. mobile et les noms',
                        disabled: true,
                        click: (): void => this.copyToClipboard(this.usersPhoneAndName),
                    },
                ],
            },
        ];
    }

    private downloadData(button: Button): void {
        button.buttons?.forEach(subButton => (subButton.disabled = true));

        switch (this.type) {
            case 'emailAndPhoneUsers':
                this.doDownload<EmailAndPhoneUsers>(
                    button,
                    emailAndPhoneUsersQuery,
                    resultData => resultData.users.items,
                );
                break;
            case 'bookingsWithOwnerContact':
                this.doDownload<BookingsWithOwnerContact>(button, bookingsWithOwnerContactQuery, resultData => {
                    const result: UserContactData[] = [];
                    resultData.bookings.items.forEach(booking => {
                        if (booking.owner) {
                            result.push(booking.owner);
                        }
                    });

                    return result;
                });
                break;
            default:
                throw new Error('Unsupported contact type: ' + (this.type as string));
        }
    }

    private doDownload<T>(
        button: Button,
        query: DocumentNode,
        mapResultFunction: (result: T) => UserContactData[],
    ): void {
        const qvm = new NaturalQueryVariablesManager(this.variablesManager);
        qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}} as Partial<V>);

        this.apollo
            .query<T, V>({
                query: query,
                variables: qvm.variables.value,
            })
            .subscribe(result => {
                button.buttons?.forEach(subButton => (subButton.disabled = false));
                const users = mapResultFunction(result.data);

                this.usersEmail = users
                    .filter(u => u.email)
                    .map(u => u.email)
                    .join(' ;,'); // all separators for different mailboxes

                this.usersEmailAndName = users
                    .filter(u => u.email)
                    .map(u => [u.email, u.firstName, u.lastName].join(';'))
                    .join('\n');

                this.usersPhoneAndName = users
                    .filter(u => u.mobilePhone)
                    .map(u => [u.mobilePhone, u.firstName, u.lastName].join(';'))
                    .join('\n');
            });
    }

    private copyToClipboard(text: string | null): void {
        if (!text) {
            return;
        }

        copyToClipboard(this.document, text);
    }
}
