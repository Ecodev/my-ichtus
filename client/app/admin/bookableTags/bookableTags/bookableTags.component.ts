import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalAvatarComponent,
    NaturalTableButtonComponent,
    NaturalFixedButtonComponent,
} from '@ecodev/natural';
import {BookableTagService} from '../services/bookableTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-bookable-tags',
    templateUrl: './bookableTags.component.html',
    styleUrl: './bookableTags.component.scss',
    standalone: true,
    imports: [
        FlexModule,
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
    ],
})
export class BookableTagsComponent extends NaturalAbstractList<BookableTagService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'color', label: 'Couleur'},
        {id: 'name', label: 'Nom'},
    ];
    public constructor(
        bookableTagService: BookableTagService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookableTagService);
    }
}
