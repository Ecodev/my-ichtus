import {Apollo, gql} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {userMetaFragment} from '../../../shared/queries/fragments';
import {CreateImage, CreateImageVariables, ImageInput} from '../../../shared/generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

export const createImageMutation = gql`
    mutation CreateImage($input: ImageInput!) {
        createImage(input: $input) {
            id
            creator {
                ...UserMeta
            }
        }
    }
    ${userMetaFragment}
`;

@Injectable({
    providedIn: 'root',
})
export class ImageService extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    CreateImage['createImage'],
    CreateImageVariables,
    any,
    any,
    any,
    any
> {
    constructor(apollo: Apollo) {
        super(apollo, 'image', null, null, createImageMutation, null, null);
    }

    protected getDefaultForServer(): ImageInput {
        return {
            file: null as unknown as File,
        };
    }
}
