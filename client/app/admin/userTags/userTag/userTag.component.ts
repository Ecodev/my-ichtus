import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractDetail } from '../../shared/components/AbstractDetail';
import { AlertService } from '../../../shared/components/alert/alert.service';
import {
    CreateUserTag,
    CreateUserTagVariables,
    DeleteUserTags,
    UpdateUserTag,
    UpdateUserTagVariables,
    UserTag,
    UserTagVariables,
} from '../../../shared/generated-types';
import { UserTagService } from '../services/userTag.service';

@Component({
    selector: 'app-user-tag',
    templateUrl: './userTag.component.html',
    styleUrls: ['./userTag.component.scss'],
})
export class UserTagComponent
    extends AbstractDetail<UserTag['userTag'],
        UserTagVariables,
        CreateUserTag['createUserTag'],
        CreateUserTagVariables,
        UpdateUserTag['updateUserTag'],
        UpdateUserTagVariables,
        DeleteUserTags> {

    constructor(alertService: AlertService,
                userTagService: UserTagService,
                router: Router,
                route: ActivatedRoute,
                public tagService: UserTagService,
    ) {
        super('userTag', userTagService, alertService, router, route);
    }
}
