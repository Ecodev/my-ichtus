import {Injectable} from '@angular/core';
import {type FormAsyncValidators, type FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {createUserTag, deleteUserTags, updateUserTag, userTagQuery, userTagsQuery} from './userTag.queries';
import {
    type CreateUserTag,
    type CreateUserTagVariables,
    type DeleteUserTags,
    type DeleteUserTagsVariables,
    type UpdateUserTag,
    type UpdateUserTagVariables,
    type UserTagInput,
    type UserTagQuery,
    type UserTagQueryVariables,
    type UserTagsQuery,
    type UserTagsQueryVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class UserTagService extends NaturalAbstractModelService<
    UserTagQuery['userTag'],
    UserTagQueryVariables,
    UserTagsQuery['userTags'],
    UserTagsQueryVariables,
    CreateUserTag['createUserTag'],
    CreateUserTagVariables,
    UpdateUserTag['updateUserTag'],
    UpdateUserTagVariables,
    DeleteUserTags,
    DeleteUserTagsVariables
> {
    public constructor() {
        super('userTag', userTagQuery, userTagsQuery, createUserTag, updateUserTag, deleteUserTags);
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

    public override getFormAsyncValidators(model: UserTagQuery['userTag']): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
