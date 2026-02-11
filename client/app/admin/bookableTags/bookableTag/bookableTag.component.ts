import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalErrorMessagePipe,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalSeoResolveData,
    NaturalStampComponent,
} from '@ecodev/natural';
import {Component, inject} from '@angular/core';
import {BookableTagService} from '../services/bookableTag.service';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';

@Component({
    selector: 'app-bookable-tag',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalDetailHeaderComponent,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        MatDivider,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatInput,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
    templateUrl: './bookableTag.component.html',
    styleUrl: './bookableTag.component.scss',
})
export class BookableTagComponent extends NaturalAbstractDetail<BookableTagService, NaturalSeoResolveData> {
    public constructor() {
        super('bookableTag', inject(BookableTagService));
    }
}
