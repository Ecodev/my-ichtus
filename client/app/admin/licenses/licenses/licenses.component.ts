import {Component, Injector, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {LicenseService} from '../services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
})
export class LicensesComponent extends NaturalAbstractList<LicenseService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [{id: 'name', label: 'Nom'}];
    public constructor(
        licenseService: LicenseService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(licenseService, injector);
    }
}
