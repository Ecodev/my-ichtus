import {Component, inject} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
    NaturalSeoResolveData,
} from '@ecodev/natural';
import {BookableTagService} from '../services/bookableTag.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';

@Component({
    selector: 'app-bookable-tag',
    templateUrl: './bookableTag.component.html',
    styleUrl: './bookableTag.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTabsModule,
        NaturalLinkableTabDirective,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class BookableTagComponent extends NaturalAbstractDetail<BookableTagService, NaturalSeoResolveData> {
    public constructor() {
        super('bookableTag', inject(BookableTagService));
    }
}
