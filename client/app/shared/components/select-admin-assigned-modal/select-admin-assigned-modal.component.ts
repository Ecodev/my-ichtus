import {Component} from '@angular/core';
import {BookableService} from '../../../admin/bookables/services/bookable.service';
import {BookableTagService} from '../../../admin/bookableTags/services/bookableTag.service';
import {Bookables} from '../../generated-types';
import {MatButtonModule} from '@angular/material/button';
import {NaturalSelectComponent} from '@ecodev/natural';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-select-admin-assigned-modal',
    templateUrl: './select-admin-assigned-modal.component.html',
    standalone: true,
    imports: [MatDialogModule, FlexModule, NaturalSelectComponent, MatButtonModule],
})
export class SelectAdminAssignedModalComponent {
    public selection: string | Bookables['bookables']['items'][0] | null = null;
    public variables = BookableService.bookableByTag(BookableTagService.STORAGE);

    public constructor(public readonly bookableService: BookableService) {}
}
