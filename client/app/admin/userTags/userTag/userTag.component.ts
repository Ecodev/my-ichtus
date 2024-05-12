import {Component} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalFixedButtonDetailComponent,
    NaturalLinkableTabDirective,
    NaturalRelationsComponent,
    NaturalSeoResolveData,
    NaturalStampComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {UserService} from '../../users/services/user.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';

@Component({
    selector: 'app-user-tag',
    templateUrl: './userTag.component.html',
    styleUrl: './userTag.component.scss',
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
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class UserTagComponent extends NaturalAbstractDetail<UserTagService, NaturalSeoResolveData> {
    public constructor(
        userTagService: UserTagService,
        public readonly userService: UserService,
    ) {
        super('userTag', userTagService);
    }
}
