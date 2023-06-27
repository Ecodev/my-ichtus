import {Component, OnInit} from '@angular/core';
import {
    AvailableColumn,
    NaturalAbstractList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    NaturalFixedButtonComponent,
} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {LicenseService} from '../services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {RouterLink} from '@angular/router';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        FlexModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NaturalFixedButtonComponent,
        RouterLink,
    ],
})
export class LicensesComponent extends NaturalAbstractList<LicenseService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [{id: 'name', label: 'Nom'}];
    public constructor(
        licenseService: LicenseService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(licenseService);
    }
}
