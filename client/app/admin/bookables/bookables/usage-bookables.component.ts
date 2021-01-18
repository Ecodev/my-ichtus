import {Component, EventEmitter, Injector, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {NaturalAbstractList} from '@ecodev/natural';
import {UsageBookables_bookables_items} from '../../../shared/generated-types';

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends NaturalAbstractList<UsageBookableService> {
    @Output() public readonly select = new EventEmitter<UsageBookables_bookables_items>();

    constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(usageBookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isStorage ? 'storage' : 'bookables',
        );
    }
}
