import {gql} from 'apollo-angular';

export const openDoorMutation = gql`
    mutation OpenDoor($door: Door!) {
        openDoor(door: $door) {
            message
            timer
        }
    }
`;
