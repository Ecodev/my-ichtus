import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NaturalAbstractList,
    NaturalAlertService,
    NaturalPersistenceService,
    NaturalQueryVariablesManager,
    NaturalSearchSelections,
} from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { Users, UserStatus, UsersVariables } from '../../../shared/generated-types';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
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

    constructor(route: ActivatedRoute,
                router: Router,
                private userService: UserService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
                private apollo: Apollo,
    ) {

        super(userService,
            router,
            route,
            alertService,
            persistenceService,
        );

        this.naturalSearchConfig = naturalSearchConfigurationService.get('users');
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

    public download() {

        if (this.apollo) {
            const qvm = new NaturalQueryVariablesManager(this.variablesManager);
            qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});
            qvm.set('emailFilter', {filter: {groups: [{conditions: [{email: {null: {not: true}}}]}]}} as UsersVariables);

            this.apollo.query({query: emailUsersQuery, variables: qvm.variables.value}).subscribe(result => {
                this.usersEmail = result.data['users'].items.map(u => u.email).join(' ;,'); // all separators for different mailboxes
                this.usersEmailAndName = result.data['users'].items.map(u => [u.email, u.firstName, u.lastName].join(';')).join('\n');
            });
        }
    }

    public copy(data) {
        copy(data);
    }

}
