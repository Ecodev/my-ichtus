import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {
    CreateUserTag,
    CreateUserTagVariables,
    DeleteUserTags,
    DeleteUserTagsVariables,
    UpdateUserTag,
    UpdateUserTagVariables,
    UserTag,
    UserTagVariables,
} from '../../../shared/generated-types';
import {UserTagService} from '../services/userTag.service';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-user-tag',
    templateUrl: './userTag.component.html',
    styleUrls: ['./userTag.component.scss'],
})
export class UserTagComponent extends NaturalAbstractDetail<
    UserTag['userTag'],
    UserTagVariables,
    CreateUserTag['createUserTag'],
    CreateUserTagVariables,
    UpdateUserTag['updateUserTag'],
    UpdateUserTagVariables,
    DeleteUserTags,
    DeleteUserTagsVariables
> {
    constructor(userTagService: UserTagService, injector: Injector, public userService: UserService) {
        super('userTag', userTagService, injector);
    }
}
