import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {
    BookableTag,
    BookableTagVariables,
    CreateBookableTag,
    CreateBookableTagVariables,
    DeleteBookableTags,
    UpdateBookableTag,
    UpdateBookableTagVariables,
} from '../../../shared/generated-types';
import {BookableTagService} from '../services/bookableTag.service';

@Component({
    selector: 'app-bookable-tag',
    templateUrl: './bookableTag.component.html',
    styleUrls: ['./bookableTag.component.scss'],
})
export class BookableTagComponent extends NaturalAbstractDetail<
    BookableTag['bookableTag'],
    BookableTagVariables,
    CreateBookableTag['createBookableTag'],
    CreateBookableTagVariables,
    UpdateBookableTag['updateBookableTag'],
    UpdateBookableTagVariables,
    DeleteBookableTags
> {
    constructor(bookableTagService: BookableTagService, injector: Injector, public tagService: BookableTagService) {
        super('bookableTag', bookableTagService, injector);
    }
}
