import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalErrorMessagePipe,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalRelationsComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {Component, inject} from '@angular/core';
import {UserTagService} from '../services/userTag.service';
import {UserService} from '../../users/services/user.service';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';

@Component({
    selector: 'app-user-tag',
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
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
    templateUrl: './userTag.component.html',
    styleUrl: './userTag.component.scss',
})
export class UserTagComponent extends NaturalAbstractDetail<UserTagService, NaturalSeoResolveData> {
    protected readonly userService = inject(UserService);

    public constructor() {
        super('userTag', inject(UserTagService));
    }
}
