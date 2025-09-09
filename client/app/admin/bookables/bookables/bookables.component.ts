import {Component, inject, OnInit, output} from '@angular/core';
import {bookables, equipment} from '../../../shared/natural-search/natural-search-facets';
import {Bookables} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ParentComponent} from './parent.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlagComponent} from '../../../shared/components/flag/flag.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {
    NaturalAvatarComponent,
    NaturalColumnsPickerComponent,
    NaturalFileComponent,
    NaturalFixedButtonComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {CommonModule, DatePipe} from '@angular/common';

@Component({
    selector: 'app-bookables',
    imports: [
        CommonModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalFileComponent,
        NaturalTableButtonComponent,
        MatTooltipModule,
        FlagComponent,
        NaturalAvatarComponent,
        MatButtonModule,
        RouterLink,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        DatePipe,
    ],
    templateUrl: './bookables.component.html',
    styleUrl: './bookables.component.scss',
})
export class BookablesComponent extends ParentComponent<BookableService> implements OnInit {
    public readonly permissionsService = inject(PermissionsService);

    public readonly bookableClick = output<Bookables['bookables']['items'][0]>();

    public constructor() {
        super(inject(BookableService));
        this.naturalSearchFacets = this.route.snapshot.data.isEquipment ? equipment() : bookables();
    }

    public select(element: Bookables['bookables']['items'][0]): void {
        this.bookableClick.emit(element);
    }
}
