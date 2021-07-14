import {Component, OnInit} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';
import {Bookables_bookables_items} from '../../generated-types';

@Component({
    selector: 'natural-select-admin-assigned-modal',
    templateUrl: './select-admin-assigned-modal.component.html',
})
export class SelectAdminAssignedModalComponent implements OnInit {
    public selection: string | Bookables_bookables_items | null = null;
    public variables = BookableService.bookableByTag(BookableTagService.STORAGE);

    constructor(public readonly bookableService: BookableService) {}

    public ngOnInit(): void {}
}
