import {Component, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Bookables_bookables_items} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class BookablesComponent extends NaturalAbstractList<BookableService> implements OnInit {
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly select = new EventEmitter<Bookables_bookables_items>();
    public readonly hasUsage = false;

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
}
