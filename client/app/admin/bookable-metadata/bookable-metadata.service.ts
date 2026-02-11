import {Injectable} from '@angular/core';
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
    BookableMetadatasQuery,
    BookableMetadatasQueryVariables,
    DeleteBookableMetadatas,
    DeleteBookableMetadatasVariables,
    UpdateBookableMetadata,
    UpdateBookableMetadataVariables,
} from '../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class BookableMetadataService extends NaturalAbstractModelService<
    never,
    never,
    BookableMetadatasQuery['bookableMetadatas'],
    BookableMetadatasQueryVariables,
    never,
    UpdateBookableMetadataVariables,
    UpdateBookableMetadata['updateBookableMetadata'],
    UpdateBookableMetadataVariables,
    DeleteBookableMetadatas,
    DeleteBookableMetadatasVariables
> {
    public constructor() {
        super(
            'bookableMetadata',
            null,
            bookableMetadatasQuery,
            createBookableMetadataMutation,
            updateBookableMetadataMutation,
            deleteBookableMetadatas,
        );
    }

    public override getDefaultForServer(): BookableMetadataInput {
        return {
            name: '',
            value: '',
            bookable: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required],
            value: [Validators.required],
        };
    }
}
