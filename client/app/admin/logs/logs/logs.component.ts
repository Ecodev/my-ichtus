import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NaturalAbstractList, SortingOrder} from '@ecodev/natural';
import {CurrentUserForProfile, Logs, LogSortingField, LogsVariables, UserRole} from '../../../shared/generated-types';
import {LogService} from '../services/log.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss'],
})
export class LogsComponent extends NaturalAbstractList<Logs['logs'], LogsVariables> implements OnInit {
    public viewer: NonNullable<CurrentUserForProfile['viewer']>;
    public UserRole = UserRole;

    constructor(
        route: ActivatedRoute,
        logService: LogService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
    ) {
        super(logService, injector);

        this.naturalSearchFacets = naturalSearchFacetsService.get('logs');
        this.contextVariables = {
            sorting: [{field: LogSortingField.creationDate, order: SortingOrder.DESC}],
        };
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.viewer = this.route.snapshot.data.viewer.model;
    }
}
