import {Component, Injector} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {BookablesComponent} from './bookables.component';
import {UsageBookableService} from '../services/usage-bookable.service';

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends BookablesComponent {
    constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        permissionsService: PermissionsService,
    ) {
        super(usageBookableService, injector, naturalSearchFacetsService, permissionsService);
    }
}
