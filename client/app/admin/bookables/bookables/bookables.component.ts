import {Component, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {
    Bookables_bookables_items,
    CurrentUserForProfile_viewer,
    UsageBookables_bookables_items,
} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class BookablesComponent extends NaturalAbstractList<BookableService> implements OnInit {
    @Output() public readonly bookableClick = new EventEmitter<Bookables_bookables_items>();
    public readonly hasUsage = false;

    public UsageBookableService = UsageBookableService;

    public constructor(
        bookableService: BookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isEquipment ? 'equipment' : 'bookables',
        );
    }

    public select(element: Bookables_bookables_items): void {
        this.bookableClick.emit(element);
    }

    /**
     * placeholder
     * TODO: remove if we can after finding good solution to duality of BookablesComponent and UsageBookablesComponent
     */
    public createApplication(
        futureOwner: CurrentUserForProfile_viewer,
        bookable: UsageBookables_bookables_items,
    ): void {}
}
