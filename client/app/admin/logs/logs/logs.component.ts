import {Component, inject, OnInit} from '@angular/core';
import {
    NaturalAbstractList,
    NaturalColumnsPickerComponent,
    NaturalSearchComponent,
    NaturalTableButtonComponent,
    SortingOrder,
} from '@ecodev/natural';
import {CurrentUserForProfileQuery, LogSortingField, UserRole} from '../../../shared/generated-types';
import {LogService} from '../services/log.service';
import {logs} from '../../../shared/natural-search/natural-search-facets';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-logs',
    imports: [
        DatePipe,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatSort,
        MatSortHeader,
        NaturalTableButtonComponent,
        MatTooltip,
        MatProgressSpinner,
        MatPaginator,
    ],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent extends NaturalAbstractList<LogService> implements OnInit {
    public constructor() {
        super(inject(LogService));

        this.naturalSearchFacets = logs();
        this.forcedVariables = {
            sorting: [{field: LogSortingField.creationDate, order: SortingOrder.DESC}],
        };
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        const viewer: NonNullable<CurrentUserForProfileQuery['viewer']> = this.route.snapshot.data.viewer;

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
