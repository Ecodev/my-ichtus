import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NaturalAbstractList, SortingOrder} from '@ecodev/natural';
import {CurrentUserForProfile, LogSortingField, UserRole} from '../../../shared/generated-types';
import {LogService} from '../services/log.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss'],
})
export class LogsComponent extends NaturalAbstractList<LogService> implements OnInit {
    public constructor(
        route: ActivatedRoute,
        logService: LogService,
        injector: Injector,
        naturalSearchFacetsService: NaturalSearchFacetsService,
    ) {
        super(logService, injector);

        this.naturalSearchFacets = naturalSearchFacetsService.get('logs');
        this.forcedVariables = {
            sorting: [{field: LogSortingField.creationDate, order: SortingOrder.DESC}],
        };
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        const viewer: NonNullable<CurrentUserForProfile['viewer']> = this.route.snapshot.data.viewer.model;

        this.availableColumns = [
            {id: 'creationDate', label: 'Date'},
            {id: 'message', label: 'Message'},
            {id: 'creator', label: 'Utilisateur'},
            ...(viewer.role === UserRole.administrator
                ? [
                      {id: 'ip', label: 'IP'},
                      {id: 'referer', label: 'Referer'},
                  ]
                : []),
        ];
    }
}
