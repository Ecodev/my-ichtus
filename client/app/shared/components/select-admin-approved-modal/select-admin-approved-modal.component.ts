import {Component, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {Bookables, BookableSortingField, BookablesVariables} from '../../generated-types';
import {SelectionModel} from '@angular/cdk/collections';
import {NaturalDataSource, NaturalQueryVariablesManager} from '@ecodev/natural';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';
import {map} from 'rxjs/operators';

@Component({
    selector: 'natural-select-admin-approved-modal',
    templateUrl: './select-admin-approved-modal.component.html',
})
export class SelectAdminApprovedModalComponent implements OnInit {
    public servicesDataSource;
    public storagesDataSource;
    public formationsDataSource;
    public welcomeDataSource;
    public selection = new SelectionModel<Bookables['bookables']['items']>(true, []);

    constructor(private bookableService: BookableService) {}

    public ngOnInit(): void {
        this.fetch(BookableTagService.STORAGE).subscribe(res => (this.storagesDataSource = res));
        this.fetch(BookableTagService.SERVICE).subscribe(res => (this.servicesDataSource = res));
        this.fetch(BookableTagService.FORMATION).subscribe(res => (this.formationsDataSource = res));
        this.fetch(BookableTagService.WELCOME).subscribe(res => (this.welcomeDataSource = res));
    }

    public fetch(tag) {
        const variables = BookableService.adminApprovedByTag(tag);
        const qvm = new NaturalQueryVariablesManager<BookablesVariables>();
        qvm.set('variables', variables);
        qvm.set('sorting', {sorting: [{field: BookableSortingField.name}]});

        // Get all because requirable storages should not change
        return this.bookableService.getAll(qvm).pipe(map(result => new NaturalDataSource(result)));
    }
}
