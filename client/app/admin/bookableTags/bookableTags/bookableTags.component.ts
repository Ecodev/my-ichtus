import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {BookableTags, BookableTagsVariables} from '../../../shared/generated-types';
import {BookableTagService} from '../services/bookableTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-bookable-tags',
    templateUrl: './bookableTags.component.html',
    styleUrls: ['./bookableTags.component.scss'],
})
export class BookableTagsComponent extends NaturalAbstractList<BookableTagService> implements OnInit {
    constructor(
        bookableTagService: BookableTagService,
        injector: Injector,
        public readonly permissionsService: PermissionsService,
    ) {
        super(bookableTagService, injector);
    }
}
