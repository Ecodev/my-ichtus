import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';
import {NaturalAbstractList} from '@ecodev/natural';
import {UsageBookables_bookables_items} from '../../../shared/generated-types';
import {NaturalSearchSelections} from '@ecodev/natural/lib/modules/search/types/values';

@Component({
    selector: 'app-usage-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class UsageBookablesComponent extends NaturalAbstractList<UsageBookableService> {
    @Output() public readonly select = new EventEmitter<UsageBookables_bookables_items>();
    @Input() set selections(selections: NaturalSearchSelections) {
        this.naturalSearchSelections = selections;
    }
    public readonly hasUsage = true;

    constructor(
        usageBookableService: UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(usageBookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isStorage ? 'storage' : 'bookables',
        );
    }
}
