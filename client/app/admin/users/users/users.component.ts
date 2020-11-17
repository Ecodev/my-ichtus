import {Apollo} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList, NaturalQueryVariablesManager, NaturalSearchSelections} from '@ecodev/natural';
import {
    BankingInfosVariables,
    EmailUsers,
    EmailUsersVariables,
    Users,
    Users_users_items,
    UserStatus,
    UsersVariables,
} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {emailUsersQuery} from '../services/user.queries';
import {UserService} from '../services/user.service';
import {copy} from '../../../shared/utils';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends NaturalAbstractList<Users['users'], UsersVariables> implements OnInit {
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

    public usersEmail;
    public usersEmailAndName;

    constructor(
        route: ActivatedRoute,
        private userService: UserService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
        private apollo: Apollo,
        private dialog: MatDialog,
    ) {
        super(userService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('users');
    }

    public flagWelcomeSessionDate(user): void {
        this.userService.flagWelcomeSessionDate(user.id).subscribe(u => {
            user.welcomeSessionDate = u.welcomeSessionDate;
        });
    }

    public activate(user): void {
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

    public download(): void {
        if (this.apollo) {
            const qvm = new NaturalQueryVariablesManager(this.variablesManager);
            qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});
            qvm.set('emailFilter', {
                filter: {groups: [{conditions: [{email: {null: {not: true}}}]}]},
            } as UsersVariables);

            this.apollo
                .query<EmailUsers, EmailUsersVariables>({
                    query: emailUsersQuery,
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

    public copy(data): void {
        copy(data);
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
