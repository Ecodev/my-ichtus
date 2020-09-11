import {Component, EventEmitter, Injector, OnInit, Output, Inject} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {Bookables, BookablesVariables, UsageBookables, UsageBookablesVariables} from '../../../shared/generated-types';
import {BookableService} from '../services/bookable.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {UsageBookableService} from '../services/usage-bookable.service';

@Component({
    selector: 'app-bookables',
    templateUrl: './bookables.component.html',
    styleUrls: ['./bookables.component.scss'],
})
export class BookablesComponent
    extends NaturalAbstractList<
        Bookables['bookables'] | UsageBookables['bookables'],
        BookablesVariables | UsageBookablesVariables
    >
    implements OnInit {
    @Output() select = new EventEmitter();

    constructor(
        @Inject(BookableService) bookableService: BookableService | UsageBookableService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
        public permissionsService: PermissionsService,
    ) {
        super(bookableService, injector);
        this.naturalSearchFacets = naturalSearchFacetsService.get(
            this.route.snapshot.data.isStorage ? 'storage' : 'bookables',
        );
    }
}
