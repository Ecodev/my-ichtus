import {gql} from '@apollo/client';

export const openDoorMutation = gql`
    mutation OpenDoor($door: Door!) {
        openDoor(door: $door) {
            message
            timer
        }
    }
`;
