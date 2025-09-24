import {Component, inject, OnInit} from '@angular/core';
import {
    AvailableColumn,
    Button,
    NaturalAbstractList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalEnumPipe,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalSearchSelections,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {AsyncPipe, DatePipe} from '@angular/common';
import {BankingInfosVariables, EmailAndPhoneUsersVariables, Users, UserStatus} from '../../../shared/generated-types';
import {users} from '../../../shared/natural-search/natural-search-facets';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ProvisionComponent} from '../../../profile/components/provision/provision.component';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {CopyContactDataButtonService} from '../../../shared/components/copy-contact-data/copy-contact-data-button.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MoneyComponent} from '../../../shared/components/money/money.component';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';

@Component({
    selector: 'app-users',
    imports: [
        AsyncPipe,
        DatePipe,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatSort,
        MatSortHeader,
        NaturalAvatarComponent,
        NaturalTableButtonComponent,
        MatTooltip,
        MatButton,
        MoneyComponent,
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        RouterLink,
        NaturalEnumPipe,
    ],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent extends NaturalAbstractList<UserService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);
    private readonly dialog = inject(MatDialog);
    private readonly copyContactDataButtonService =
        inject<CopyContactDataButtonService<EmailAndPhoneUsersVariables>>(CopyContactDataButtonService);

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
        {id: 'status', label: 'État'},
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

    public constructor() {
        super(inject(UserService));

        this.naturalSearchFacets = users();
    }

    public flagWelcomeSessionDate(user: Users['users']['items'][0]): void {
        this.welcoming.set(user, true);
        this.service
            .flagWelcomeSessionDate(user.id)
            .pipe(finalize(() => this.welcoming.delete(user)))
            .subscribe();
    }

    public activate(user: Users['users']['items'][0]): void {
        if (!this.isActivable(user)) {
            return;
        }

        this.activating.set(user, true);
        this.service
            .activate(user.id)
            .pipe(finalize(() => this.activating.delete(user)))
            .subscribe();
    }

    public isActive(user: Users['users']['items'][0]): boolean {
        return user.status === UserStatus.Active;
    }

    public isActivable(user: Users['users']['items'][0]): boolean {
        return !!user.name && !!user.login;
    }

    public isNew(user: Users['users']['items'][0]): boolean {
        return user.status === UserStatus.New;
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
