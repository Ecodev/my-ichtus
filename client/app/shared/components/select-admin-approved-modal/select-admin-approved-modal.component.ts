import {Component, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {Bookables, BookableSortingField, BookablesVariables} from '../../generated-types';
import {SelectionModel} from '@angular/cdk/collections';
import {NaturalDataSource, NaturalQueryVariablesManager} from '@ecodev/natural';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';

@Component({
    selector: 'natural-select-admin-approved-modal',
    templateUrl: './select-admin-approved-modal.component.html',
})
export class SelectAdminApprovedModalComponent implements OnInit {
    public servicesDataSource;
    public storagesDataSource;
    public selection = new SelectionModel<Bookables['bookables']['items']>(true, []);

    constructor(private bookableService: BookableService) {}

    public ngOnInit(): void {
        const serviceVariables = BookableService.adminApprovedByTag(BookableTagService.SERVICE);
        const qvmServices = new NaturalQueryVariablesManager<BookablesVariables>();
        qvmServices.set('variables', serviceVariables);

        // Get all because requirable services should not change
        this.bookableService.getAll(qvmServices).subscribe(result => {
            this.servicesDataSource = new NaturalDataSource(result);
        });

        const storageVariables = BookableService.adminApprovedByTag(BookableTagService.STORAGE);
        const qvmStorage = new NaturalQueryVariablesManager<BookablesVariables>();
        qvmStorage.set('variables', storageVariables);
        qvmStorage.set('sorting', {sorting: [{field: BookableSortingField.name}]});

        // Get all because requirable storages should not change
        this.bookableService.getAll(qvmStorage).subscribe(result => {
            this.storagesDataSource = new NaturalDataSource(result);
        });
    }
}
