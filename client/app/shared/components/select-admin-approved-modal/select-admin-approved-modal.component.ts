import {Component, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {
    BookableSortingField,
    BookablesVariables,
    UsageBookables,
    UsageBookables_bookables_items,
} from '../../generated-types';
import {SelectionModel} from '@angular/cdk/collections';
import {NaturalDataSource, NaturalQueryVariablesManager} from '@ecodev/natural';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';
import {map} from 'rxjs/operators';
import {UsageBookableService} from '../../../admin/bookables/services/usage-bookable.service';
import {Observable} from 'rxjs';

export type SelectAdminApprovedModalResult = UsageBookables_bookables_items[];

@Component({
    selector: 'natural-select-admin-approved-modal',
    templateUrl: './select-admin-approved-modal.component.html',
    styleUrls: ['./select-admin-approved-modal.component.scss'],
})
export class SelectAdminApprovedModalComponent implements OnInit {
    public servicesDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public storagesDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public formationsDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public welcomeDataSource!: NaturalDataSource<UsageBookables['bookables']>;
    public selection = new SelectionModel<UsageBookables['bookables']['items']>(true, []);

    constructor(private readonly bookableService: UsageBookableService) {}

    public ngOnInit(): void {
        this.fetch(BookableTagService.STORAGE_REQUEST).subscribe(res => (this.storagesDataSource = res));
        this.fetch(BookableTagService.SERVICE).subscribe(res => (this.servicesDataSource = res));
        this.fetch(BookableTagService.FORMATION).subscribe(res => (this.formationsDataSource = res));
        this.fetch(BookableTagService.WELCOME).subscribe(res => (this.welcomeDataSource = res));
    }

    public fetch(tag: string): Observable<NaturalDataSource<UsageBookables['bookables']>> {
        const variables = BookableService.applicationByTag(tag);
        const qvm = new NaturalQueryVariablesManager<BookablesVariables>();
        qvm.set('variables', variables);
        qvm.set('sorting', {sorting: [{field: BookableSortingField.name}]});

        // Get all because requirable storages should not change
        return this.bookableService.getAll(qvm).pipe(map(result => new NaturalDataSource(result)));
    }

    public isFullyBooked(bookable: UsageBookables_bookables_items): boolean {
        return (
            bookable.simultaneousBookingMaximum !== -1 &&
            bookable.sharedBookings.length >= bookable.simultaneousBookingMaximum
        );
    }

    public isFull(show: boolean, bookable: UsageBookables_bookables_items): boolean {
        return show && this.isFullyBooked(bookable);
    }
}
