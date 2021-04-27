import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {FormAsyncValidators, FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {
    bookableTagQuery,
    bookableTagsQuery,
    createBookableTag,
    deleteBookableTags,
    updateBookableTag,
} from './bookableTag.queries';
import {
    BookableTag,
    BookableTag_bookableTag,
    BookableTagInput,
    BookableTags,
    BookableTagsVariables,
    BookableTagVariables,
    CreateBookableTag,
    CreateBookableTagVariables,
    DeleteBookableTags,
    DeleteBookableTagsVariables,
    UpdateBookableTag,
    UpdateBookableTagVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class BookableTagService extends NaturalAbstractModelService<
    BookableTag['bookableTag'],
    BookableTagVariables,
    BookableTags['bookableTags'],
    BookableTagsVariables,
    CreateBookableTag['createBookableTag'],
    CreateBookableTagVariables,
    UpdateBookableTag['updateBookableTag'],
    UpdateBookableTagVariables,
    DeleteBookableTags,
    DeleteBookableTagsVariables
> {
    constructor(apollo: Apollo) {
        super(
            apollo,
            'bookableTag',
            bookableTagQuery,
            bookableTagsQuery,
            createBookableTag,
            updateBookableTag,
            deleteBookableTags,
        );
    }

    public static readonly SERVICE = '6007';
    public static readonly STORAGE = '6008';
    public static readonly STORAGE_REQUEST = '6028';
    public static readonly FORMATION = '6017';
    public static readonly WELCOME = '6024';

    protected getDefaultForServer(): BookableTagInput {
        return {
            name: '',
            color: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }

    public getFormAsyncValidators(model: BookableTag_bookableTag): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
