import {Component, Inject, Input, OnInit} from '@angular/core';
import {copyToClipboard, NaturalAbstractController, NaturalQueryVariablesManager} from '@ecodev/natural';
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
import {takeUntil} from 'rxjs/operators';
import {bookingsWithOwnerContactQuery} from '../../../admin/bookings/services/booking.queries';
import {DOCUMENT} from '@angular/common';

export type ContactType = 'bookingsWithOwnerContact' | 'emailAndPhoneUsers';

@Component({
    selector: 'app-copy-contact-data',
    templateUrl: './copy-contact-data.component.html',
    styleUrls: ['./copy-contact-data.component.scss'],
})
export class CopyContactDataComponent<V extends EmailAndPhoneUsersVariables | BookingsWithOwnerContactVariables>
    extends NaturalAbstractController
    implements OnInit
{
    @Input() public type!: ContactType;
    @Input() public variablesManager!: NaturalQueryVariablesManager<V>;

    public fetched = false;
    public usersEmail: string | null = null;
    public usersEmailAndName: string | null = null;
    public usersPhoneAndName: string | null = null;

    public constructor(private readonly apollo: Apollo, @Inject(DOCUMENT) private readonly document: Document) {
        super();
    }

    public ngOnInit(): void {
        // When filter on parent changes, reset loaded dataset
        this.variablesManager?.variables?.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            this.fetched = false;
            this.usersEmail = null;
            this.usersEmailAndName = null;
            this.usersPhoneAndName = null;
        });
    }

    public downloadData(): void {
        if (this.fetched) {
            return;
        }

        switch (this.type) {
            case 'emailAndPhoneUsers':
                this.doDownload<EmailAndPhoneUsers>(emailAndPhoneUsersQuery, resultData => resultData['users'].items);
                break;
            case 'bookingsWithOwnerContact':
                this.doDownload<BookingsWithOwnerContact>(bookingsWithOwnerContactQuery, resultData => {
                    const result: UserContactData[] = [];
                    resultData['bookings'].items.forEach(booking => {
                        if (booking.owner) {
                            result.push(booking.owner);
                        }
                    });

                    return result;
                });
                break;
            default:
                throw new Error('Unsupported contact type: ' + this.type);
        }
    }

    private doDownload<T>(query: DocumentNode, mapResultFunction: (result: T) => UserContactData[]): void {
        const qvm = new NaturalQueryVariablesManager(this.variablesManager);
        qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}} as Partial<V>);

        this.apollo
            .query<T, V>({
                query: query,
                variables: qvm.variables.value,
            })
            .subscribe(result => {
                this.fetched = true;
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

    public copyToClipboard(text: string | null): void {
        if (!text) {
            return;
        }
        copyToClipboard(this.document, text);
    }
}
