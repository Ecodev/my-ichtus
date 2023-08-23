import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    FormAsyncValidators,
    FormValidators,
    NaturalAbstractModelService,
    NaturalDebounceService,
    unique,
} from '@ecodev/natural';
import {
    bookableTagQuery,
    bookableTagsQuery,
    createBookableTag,
    deleteBookableTags,
    updateBookableTag,
} from './bookableTag.queries';
import {
    BookableTag,
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
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(
            apollo,
            naturalDebounceService,
            'bookableTag',
            bookableTagQuery,
            bookableTagsQuery,
            createBookableTag,
            updateBookableTag,
            deleteBookableTags,
        );
    }

    // Hardcoded tags from production database used to force filter lists of bookables
    public static readonly SERVICE = '6007';
    public static readonly STORAGE = '6008';
    public static readonly ARMOIRE = '6009';
    public static readonly CASIER = '6010';
    public static readonly FLOTTEUR = '6011';
    public static readonly RATELIER_WB = '6016';
    public static readonly STORAGE_REQUEST = '6028';
    public static readonly FORMATION = '6017';
    public static readonly WELCOME = '6024';
    public static readonly SURVEY = '6036';
    public static readonly NFT = '6042';

    public override getDefaultForServer(): BookableTagInput {
        return {
            name: '',
            color: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }

    public override getFormAsyncValidators(model: BookableTag['bookableTag']): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
