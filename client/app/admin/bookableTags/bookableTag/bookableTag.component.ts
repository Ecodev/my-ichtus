import {Component} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
} from '@ecodev/natural';
import {BookableTagService} from '../services/bookableTag.service';
import {NgIf} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-bookable-tag',
    templateUrl: './bookableTag.component.html',
    styleUrls: ['./bookableTag.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        NgIf,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class BookableTagComponent extends NaturalAbstractDetail<BookableTagService> {
    public constructor(bookableTagService: BookableTagService, public readonly tagService: BookableTagService) {
        super('bookableTag', bookableTagService);
    }
}
