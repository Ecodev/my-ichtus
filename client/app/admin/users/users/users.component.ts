import {Apollo} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractList,
    NaturalSearchSelections,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalAvatarComponent,
    NaturalTableButtonComponent,
    NaturalFixedButtonComponent,
    NaturalCapitalizePipe,
    NaturalEnumPipe,
    NaturalSwissDatePipe,
} from '@ecodev/natural';
import {BankingInfosVariables, EmailAndPhoneUsersVariables, Users, UserStatus} from '../../../shared/generated-types';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {CopyContactDataButtonService} from '../../../shared/components/copy-contact-data/copy-contact-data-button.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
    standalone: true,
    imports: [
        CommonModule,

        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalAvatarComponent,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatButtonModule,
        MoneyComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalCapitalizePipe,
        NaturalEnumPipe,
        NaturalSwissDatePipe,
    ],
})
export class UsersComponent extends NaturalAbstractList<UserService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'balance', label: 'Solde'},
        {id: 'name', label: 'Nom'},
        {id: 'login', label: 'Login'},
        {id: 'age', label: 'Âge'},
        {id: 'role', label: 'Rôle', checked: false},
        {id: 'owner', label: 'Chef de famille', checked: false},
        {id: 'creationDate', label: 'Créé le'},
        {id: 'updateDate', label: 'Modifié le'},
        {id: 'resignDate', label: 'Date démission', checked: false},
        {id: 'status', label: 'Status'},
        {id: 'email', label: 'Email', checked: false},
        {id: 'mobilePhone', label: 'Téléphone', checked: false},
        {id: 'flagWelcomeSessionDate', label: "Séance d'accueil"},
        {id: 'provision', label: 'Versement', checked: false},
    ];

    public readonly buttons: Button[] = this.copyContactDataButtonService.getButtons(
        this.variablesManager,
        'emailAndPhoneUsers',
    );

    public readonly activating = new Map<Users['users']['items'][0], true>();
    public readonly welcoming = new Map<Users['users']['items'][0], true>();

    public constructor(
        route: ActivatedRoute,
        private readonly userService: UserService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
        private readonly apollo: Apollo,
        private readonly dialog: MatDialog,
        private readonly copyContactDataButtonService: CopyContactDataButtonService<EmailAndPhoneUsersVariables>,
    ) {
        super(userService);
        this.naturalSearchFacets = naturalSearchFacetsService.get('users');
    }

    public flagWelcomeSessionDate(user: Users['users']['items'][0]): void {
        this.welcoming.set(user, true);
        this.userService
            .flagWelcomeSessionDate(user.id)
            .pipe(finalize(() => this.welcoming.delete(user)))
            .subscribe();
    }

    public activate(user: Users['users']['items'][0]): void {
        if (!this.isActivable(user)) {
            return;
        }

        this.activating.set(user, true);
        this.userService
            .activate(user.id)
            .pipe(finalize(() => this.activating.delete(user)))
            .subscribe();
    }

    public isActive(user: Users['users']['items'][0]): boolean {
        return user.status === UserStatus.active;
    }

    public isActivable(user: Users['users']['items'][0]): boolean {
        return !!user.name && !!user.login;
    }

    public isNew(user: Users['users']['items'][0]): boolean {
        return user.status === UserStatus.new;
    }

    public override search(naturalSearchSelections: NaturalSearchSelections): void {
        super.search(naturalSearchSelections);
    }

    public showProvision(user: Users['users']['items'][0]): void {
        const config: MatDialogConfig<BankingInfosVariables> = {
            data: {
                user: user,
            },
        };

        this.dialog.open(ProvisionComponent, config);
    }
}
