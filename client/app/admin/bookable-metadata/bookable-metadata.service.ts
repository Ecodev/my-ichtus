import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
    bookableMetadatasQuery,
    createBookableMetadataMutation,
    deleteBookableMetadatas,
    updateBookableMetadataMutation,
} from './bookable-metadata.queries';
import {Validators} from '@angular/forms';

import {FormValidators, NaturalAbstractModelService} from '@ecodev/natural';
import {
    BookableMetadataInput,
    BookableMetadatas,
    BookableMetadatasVariables,
    DeleteBookableMetadatas,
    DeleteBookableMetadatasVariables,
    UpdateBookableMetadata,
    UpdateBookableMetadataVariables,
} from '../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class BookableMetadataService extends NaturalAbstractModelService<
    any,
    any,
    BookableMetadatas['bookableMetadatas'],
    BookableMetadatasVariables,
    any,
    any,
    UpdateBookableMetadata['updateBookableMetadata'],
    UpdateBookableMetadataVariables,
    DeleteBookableMetadatas,
    DeleteBookableMetadatasVariables
> {
    constructor(apollo: Apollo) {
        super(
            apollo,
            'bookableMetadata',
            null,
            bookableMetadatasQuery,
            createBookableMetadataMutation,
            updateBookableMetadataMutation,
            deleteBookableMetadatas,
        );
    }

    protected getDefaultForServer(): BookableMetadataInput {
        return {
            name: '',
            value: '',
            bookable: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required],
            value: [Validators.required],
        };
    }
}
