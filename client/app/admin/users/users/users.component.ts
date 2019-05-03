import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NaturalAbstractList, NaturalAlertService, NaturalPersistenceService, NaturalQueryVariablesManager } from '@ecodev/natural';
import { Apollo } from 'apollo-angular';
import { Users, UserStatus, UsersVariables } from '../../../shared/generated-types';
import { NaturalSearchConfigurationService } from '../../../shared/natural-search/natural-search-configuration.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { copy } from '../../../shared/utils';
import { emailUsersQuery } from '../services/user.queries';
import { UserService } from '../services/user.service';

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

    constructor(route: ActivatedRoute,
                router: Router,
                private userService: UserService,
                alertService: NaturalAlertService,
                persistenceService: NaturalPersistenceService,
                naturalSearchConfigurationService: NaturalSearchConfigurationService,
                public permissionsService: PermissionsService,
                private apollo: Apollo,
                private snackBar: MatSnackBar,
    ) {

        super('users',
            userService,
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

    public copy() {

        if (this.apollo) {
            const qvm = new NaturalQueryVariablesManager(this.variablesManager);
            qvm.set('pagination', {pagination: {pageIndex: 0, pageSize: 9999}});

            const snackbarOptions: MatSnackBarConfig = {
                horizontalPosition: 'end',
                verticalPosition: 'top',
                duration: 6000,
            };

            this.apollo.query({query: emailUsersQuery, variables: qvm.variables.value}).subscribe(result => {
                const simpleUsers = result.data['users'].items.map(u => u.email).join(' ;,'); // all separators for different mailboxes
                copy(simpleUsers);
                this.snackBar.open('La liste des utilisateurs a été copiée', 'Faire une copie avancée', snackbarOptions)
                    .onAction()
                    .subscribe(() => {
                        // CSV usage : separator is ";"
                        const csvUsers = result.data['users'].items.map(u => [u.email, u.firstName, u.lastName].join(';')).join('\n');
                        copy(csvUsers);
                    });
            });
        }
    }

}
