import {Component} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {BookableTagService} from '../services/bookableTag.service';

@Component({
    selector: 'app-bookable-tag',
    templateUrl: './bookableTag.component.html',
    styleUrls: ['./bookableTag.component.scss'],
})
export class BookableTagComponent extends NaturalAbstractDetail<BookableTagService> {
    public constructor(bookableTagService: BookableTagService, public readonly tagService: BookableTagService) {
        super('bookableTag', bookableTagService);
    }
}
