import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatDividerModule} from '@angular/material/divider';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-user-tags',
    templateUrl: './userTags.component.html',
    styleUrl: './userTags.component.scss',
    standalone: true,
    imports: [
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalAvatarComponent,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
        MatDividerModule,
        AsyncPipe,
    ],
})
export class UserTagsComponent extends NaturalAbstractList<UserTagService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'color', label: 'Couleur'},
        {id: 'name', label: 'Nom'},
    ];

    public constructor(
        userTagService: UserTagService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(userTagService);
    }
}
