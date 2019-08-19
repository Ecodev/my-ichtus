import { Component, Injector, OnInit } from '@angular/core';
import { NaturalAbstractList, NaturalQueryVariablesManager, NaturalSearchSelections } from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { EmailUsers, EmailUsersVariables, Users, UserStatus, UsersVariables } from '../../../shared/generated-types';
import { NaturalSearchFacetsService } from '../../../shared/natural-search/natural-search-facets.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { emailUsersQuery } from '../services/user.queries';
import { UserService } from '../services/user.service';
import { copy } from '../../../shared/utils';

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

    constructor(private userService: UserService,
                injector: Injector,
                naturalSearchFacetsService: NaturalSearchFacetsService,
                public permissionsService: PermissionsService,
                private apollo: Apollo,
    ) {

        super(userService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get('users');
    }

    public flagWelcomeSessionDate(user) {
        this.userService.flagWelcomeSessionDate(user.id).subscribe((u) => {
            user = u;
        });
    }

    public activate(user) {
        this.userService.activate(user.id).subscribe((u) => {
            user = u;
        });
    }

    public isActive(user) {
        return user.status === UserStatus.active;
    }

    public isNew(user) {
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
            qvm.set('emailFilter', {filter: {groups: [{conditions: [{email: {null: {not: true}}}]}]}} as UsersVariables);

            this.apollo.query<EmailUsers, EmailUsersVariables>({
                query: emailUsersQuery,
                variables: qvm.variables.value,
            }).subscribe(result => {
                this.usersEmail = result.data['users'].items.map(u => u.email).join(' ;,'); // all separators for different mailboxes
                this.usersEmailAndName = result.data['users'].items.map(u => [u.email, u.firstName, u.lastName].join(';')).join('\n');
            });
        }
    }

    public copy(data) {
        copy(data);
    }

}
