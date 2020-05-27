import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Licenses, LicensesVariables} from '../../../shared/generated-types';
import {LicenseService} from '../services/license.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
})
export class LicensesComponent extends NaturalAbstractList<Licenses['licenses'], LicensesVariables> implements OnInit {
    constructor(
        licenseService: LicenseService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(licenseService, injector);
    }
}
