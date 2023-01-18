import {Apollo} from 'apollo-angular';
import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList, NaturalSearchSelections} from '@ecodev/natural';
import {BankingInfosVariables, Users_users_items, UserStatus} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {ActivatedRoute} from '@angular/router';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends NaturalAbstractList<UserService> implements OnInit {
    public override selectedColumns = [
        'balance',
        'name',
        'login',
        'age',
        'creationDate',
        'updateDate',
        'status',
        'flagWelcomeSessionDate',
    ];

    public readonly activating = new Map<Users_users_items, true>();
    public readonly welcoming = new Map<Users_users_items, true>();

    public constructor(
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
        this.welcoming.set(user, true);
        this.userService
            .flagWelcomeSessionDate(user.id)
            .pipe(finalize(() => this.welcoming.delete(user)))
            .subscribe();
    }

    public activate(user: Users_users_items): void {
        if (!this.isActivable(user)) {
            return;
        }

        this.activating.set(user, true);
        this.userService
            .activate(user.id)
            .pipe(finalize(() => this.activating.delete(user)))
            .subscribe();
    }

    public isActive(user: Users_users_items): boolean {
        return user.status === UserStatus.active;
    }

    public isActivable(user: Users_users_items): boolean {
        return !!user.name && !!user.login;
    }

    public isNew(user: Users_users_items): boolean {
        return user.status === UserStatus.new;
    }

    public override search(naturalSearchSelections: NaturalSearchSelections): void {
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
