import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
    NaturalAbstractList,
    SortingOrder,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {CurrentUserForProfile, LogSortingField, UserRole} from '../../../shared/generated-types';
import {LogService} from '../services/log.service';
import {NaturalSearchFacetsService} from '../../../shared/natural-search/natural-search-facets.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
})
export class LogsComponent extends NaturalAbstractList<LogService> implements OnInit {
    public constructor(
        route: ActivatedRoute,
        logService: LogService,
        naturalSearchFacetsService: NaturalSearchFacetsService,
    ) {
        super(logService);

        this.naturalSearchFacets = naturalSearchFacetsService.get('logs');
        this.forcedVariables = {
            sorting: [{field: LogSortingField.creationDate, order: SortingOrder.DESC}],
        };
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        const viewer: NonNullable<CurrentUserForProfile['viewer']> = this.route.snapshot.data.viewer;

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
