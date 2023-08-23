import {Apollo, gql} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {userMetaFragment} from '../../../shared/queries/fragments';
import {CreateImage, CreateImageVariables, ImageInput} from '../../../shared/generated-types';
import {NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';

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
    never,
    never,
    never,
    never,
    CreateImage['createImage'],
    CreateImageVariables,
    never,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'image', null, null, createImageMutation, null, null);
    }

    public override getDefaultForServer(): ImageInput {
        return {
            file: null as unknown as File,
        };
    }
}
