import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {
    bookableMetadatasQuery,
    createBookableMetadataMutation,
    deleteBookableMetadatas,
    updateBookableMetadataMutation,
} from './bookable-metadata.queries';
import {Validators} from '@angular/forms';
import {FormValidators, NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';
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
    never,
    never,
    BookableMetadatas['bookableMetadatas'],
    BookableMetadatasVariables,
    never,
    never,
    UpdateBookableMetadata['updateBookableMetadata'],
    UpdateBookableMetadataVariables,
    DeleteBookableMetadatas,
    DeleteBookableMetadatasVariables
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(
            apollo,
            naturalDebounceService,
            'bookableMetadata',
            null,
            bookableMetadatasQuery,
            createBookableMetadataMutation,
            updateBookableMetadataMutation,
            deleteBookableMetadatas,
        );
    }

    protected override getDefaultForServer(): BookableMetadataInput {
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
