import gql from 'graphql-tag';

export const openDoorMutation = gql`
    mutation OpenDoor($door: Door!) {
        openDoor(door: $door) {
            message
            timer
        }
    }
`;
