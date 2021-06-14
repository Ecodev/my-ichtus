import {Apollo} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList, NaturalSearchSelections} from '@ecodev/natural';
import {
    BankingInfosVariables,
    EmailAndPhoneUsers,
    Users_users_items,
    UserStatus,
} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {ActivatedRoute} from '@angular/router';
import {emailAndPhoneUsersQuery} from '../services/user.queries';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends NaturalAbstractList<UserService> implements OnInit {
    public queryForContacts = emailAndPhoneUsersQuery;
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

    public mapResultFunction = (resultData: EmailAndPhoneUsers) => resultData['users'].items;

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
        super.search(naturalSearchSelections);
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
