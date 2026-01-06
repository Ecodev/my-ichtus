import {Component, inject, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    TypedMatCellDef,
} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-user-tags',
    imports: [
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
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
        MatProgressSpinner,
        MatPaginator,
        NaturalFixedButtonComponent,
        RouterLink,
        AsyncPipe,
    ],
    templateUrl: './userTags.component.html',
    styleUrl: './userTags.component.scss',
})
export class UserTagsComponent extends NaturalAbstractList<UserTagService> implements OnInit {
    protected readonly permissionsService = inject(PermissionsService);

    public override availableColumns: AvailableColumn[] = [
        {id: 'color', label: 'Couleur'},
        {id: 'name', label: 'Nom'},
    ];

    public constructor() {
        super(inject(UserTagService));
    }
}
