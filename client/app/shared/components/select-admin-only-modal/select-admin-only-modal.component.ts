import { Component, OnInit } from '@angular/core';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { BookableTagService } from '../../../admin/bookableTags/services/bookableTag.service';

@Component({
    selector: 'natural-select-admin-only-modal',
    templateUrl: './select-admin-only-modal.component.html',
})
export class SelectAdminOnlyModalComponent implements OnInit {

    public selection;
    public variables = BookableService.adminByTag(BookableTagService.STORAGE);

    constructor(public bookableService: BookableService) {
    }

    public ngOnInit(): void {
    }

}
