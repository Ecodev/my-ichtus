import {Component} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalDetailHeaderComponent,
    NaturalLinkableTabDirective,
    NaturalRelationsComponent,
    NaturalTableButtonComponent,
    NaturalStampComponent,
    NaturalFixedButtonDetailComponent,
} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {UserService} from '../../users/services/user.service';
import {NgIf} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {MatTabsModule} from '@angular/material/tabs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-user-tag',
    templateUrl: './userTag.component.html',
    styleUrls: ['./userTag.component.scss'],
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
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class UserTagComponent extends NaturalAbstractDetail<UserTagService> {
    public constructor(userTagService: UserTagService, public readonly userService: UserService) {
        super('userTag', userTagService);
    }
}
