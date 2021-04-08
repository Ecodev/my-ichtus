import {Apollo} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList, NaturalQueryVariablesManager, NaturalSearchSelections} from '@ecodev/natural';
import {
    BankingInfosVariables,
    EmailAndPhoneUsers,
    EmailAndPhoneUsersVariables,
    Users_users_items,
    UserStatus,
    UsersVariables,
} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {emailAndPhoneUsersQuery} from '../services/user.queries';
import {UserService} from '../services/user.service';
import {copyToClipboard} from '../../../shared/utils';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {ApolloQueryResult} from '@apollo/client/core';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends NaturalAbstractList<UserService> implements OnInit {
    public initialColumns = [
        'balance',
        'name',
        'login',
        'age',
        'creationDate',
        'updateDate',
        'status',
        'flagWelcomeSessionDate',
    ];

    public usersEmail: string | null = null;
    public usersEmailAndName: string | null = null;
    public usersPhoneAndName: string | null = null;

    constructor(
        route: ActivatedRoute,
        private readonly userService: UserService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly apollo: Apollo,
        private readonly dialog: MatDialog,
    ) {
        super(userService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('users');
    }

    public flagWelcomeSessionDate(user: Users_users_items): void {
        this.userService.flagWelcomeSessionDate(user.id).subscribe(u => {
            user.welcomeSessionDate = u.welcomeSessionDate;
        });
    }

    public activate(user: Users_users_items): void {
        this.userService.activate(user.id).subscribe(u => {
            user.status = u.status;
        });
    }

    public isActive(user: Users_users_items): boolean {
        return user.status === UserStatus.active;
    }

    public isNew(user: Users_users_items): boolean {
        return user.status === UserStatus.new;
    }

    public search(naturalSearchSelections: NaturalSearchSelections): void {
        this.usersEmail = null;
        this.usersEmailAndName = null;
        super.search(naturalSearchSelections);
    }

    public downloadEmails(): void {
        if (this.apollo) {
            const qvm = new NaturalQueryVariablesManager(this.variablesManager);
            qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});
            qvm.set('emailFilter', {
                filter: {groups: [{conditions: [{email: {null: {not: true}}}]}]},
            } as UsersVariables);

            this.apollo
                .query<EmailAndPhoneUsers, EmailAndPhoneUsersVariables>({
                    query: emailAndPhoneUsersQuery,
                    variables: qvm.variables.value,
                })
                .subscribe(result => {
                    this.usersEmail = result.data['users'].items.map(u => u.email).join(' ;,'); // all separators for different mailboxes
                    this.usersEmailAndName = result.data['users'].items
                        .map(u => [u.email, u.firstName, u.lastName].join(';'))
                        .join('\n');
                });
        }
    }

    public downloadPhones(): Observable<ApolloQueryResult<EmailAndPhoneUsers>> | null {
        if (this.apollo) {
            const qvm = new NaturalQueryVariablesManager(this.variablesManager);
            qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});
            qvm.set('phoneFilter', {
                filter: {groups: [{conditions: [{mobilePhone: {equal: {value: '', not: true}}}]}]},
            } as UsersVariables);

            const obs = this.apollo.query<EmailAndPhoneUsers, EmailAndPhoneUsersVariables>({
                query: emailAndPhoneUsersQuery,
                variables: qvm.variables.value,
            });

            obs.subscribe(result => {
                this.usersPhoneAndName = result.data['users'].items
                    .map(u => [u.mobilePhone, u.firstName, u.lastName].join(';'))
                    .join('\n');
            });
            return obs;
        }
        return null;
    }

    public copyToClipboard(text: string): void {
        copyToClipboard(text);
    }

    public copyPhones(): void {
        let obs;
        if (!this.usersPhoneAndName) {
            obs = this.downloadPhones();
        }
        if (obs) {
            obs.subscribe(result => {
                if (this.usersPhoneAndName) {
                    copyToClipboard(this.usersPhoneAndName);
                }
            });
        }
    }

    public showProvision(user: Users_users_items): void {
        const config: MatDialogConfig<BankingInfosVariables> = {
            data: {
                user: user,
            },
        };

        this.dialog.open(ProvisionComponent, config);
    }
}
