import {Component, Input, OnInit} from '@angular/core';
import {NaturalQueryVariablesManager} from '@ecodev/natural';
import {EmailAndPhoneUsersVariables, UserContactData} from '../../generated-types';
import {Apollo} from 'apollo-angular';
import {copyToClipboard} from '../../../shared/utils';
import {DocumentNode} from 'graphql';

@Component({
    selector: 'app-copy-contact-data',
    templateUrl: './copy-contact-data.component.html',
    styleUrls: ['./copy-contact-data.component.scss'],
})
export class CopyContactDataComponent implements OnInit {
    @Input() public variablesManager!: NaturalQueryVariablesManager;
    @Input() public query!: DocumentNode;

    /**
     * Map function that replaces the result of the query by a list with wanted users
     */
    @Input() public mapResultFunction!: (resultData: any) => UserContactData[];

    public fetched = false;
    public usersEmail: string | null = null;
    public usersEmailAndName: string | null = null;
    public usersPhoneAndName: string | null = null;

    constructor(private readonly apollo: Apollo) {}

    public ngOnInit(): void {
        // When filter on parent changes, reset loaded dataset
        this.variablesManager?.variables?.subscribe(() => {
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

        const qvm = new NaturalQueryVariablesManager(this.variablesManager);
        qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});

        this.apollo
            .query<UserContactData, EmailAndPhoneUsersVariables>({
                query: this.query,
                variables: qvm.variables.value,
            })
            .subscribe(result => {
                this.fetched = true;
                const users = this.mapResultFunction(result.data);
                this.usersEmail = users
                    .filter(u => u.email)
                    .map(u => u.email)
                    .join(' ;,'); // all separators for different mailboxes,
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
        copyToClipboard(text);
    }
}
