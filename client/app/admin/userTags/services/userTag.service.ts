import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    FormAsyncValidators,
    FormValidators,
    NaturalAbstractModelService,
    unique,
    NaturalDebounceService,
} from '@ecodev/natural';
import {createUserTag, deleteUserTags, updateUserTag, userTagQuery, userTagsQuery} from './userTag.queries';
import {
    CreateUserTag,
    CreateUserTagVariables,
    DeleteUserTags,
    DeleteUserTagsVariables,
    UpdateUserTag,
    UpdateUserTagVariables,
    UserTag,
    UserTagInput,
    UserTags,
    UserTagsVariables,
    UserTagVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class UserTagService extends NaturalAbstractModelService<
    UserTag['userTag'],
    UserTagVariables,
    UserTags['userTags'],
    UserTagsVariables,
    CreateUserTag['createUserTag'],
    CreateUserTagVariables,
    UpdateUserTag['updateUserTag'],
    UpdateUserTagVariables,
    DeleteUserTags,
    DeleteUserTagsVariables
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(
            apollo,
            naturalDebounceService,
            'userTag',
            userTagQuery,
            userTagsQuery,
            createUserTag,
            updateUserTag,
            deleteUserTags,
        );
    }

    public override getDefaultForServer(): UserTagInput {
        return {
            name: '',
            color: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            color: [],
        };
    }

    public override getFormAsyncValidators(model: UserTag['userTag']): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
