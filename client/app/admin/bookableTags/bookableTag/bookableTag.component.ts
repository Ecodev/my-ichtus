import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {BookableTagService} from '../services/bookableTag.service';

@Component({
    selector: 'app-bookable-tag',
    templateUrl: './bookableTag.component.html',
    styleUrls: ['./bookableTag.component.scss'],
})
export class BookableTagComponent extends NaturalAbstractDetail<BookableTagService> {
    constructor(
        bookableTagService: BookableTagService,
        injector: Injector,
        public readonly tagService: BookableTagService,
    ) {
        super('bookableTag', bookableTagService, injector);
    }
}
