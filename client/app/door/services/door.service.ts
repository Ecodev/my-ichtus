import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {openDoorMutation} from './door.queries';
import {CurrentUserForProfile, OpenDoor, OpenDoorVariables} from '../../shared/generated-types';

interface DoorConfig {
    id: keyof Pick<NonNullable<CurrentUserForProfile['viewer']>, 'door1' | 'door2' | 'door3' | 'door4'>;
    name: string;
    image: string;
    opened: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class DoorService {
    public constructor(private readonly apollo: Apollo) {}

    public doors: DoorConfig[] = [
        {
            id: 'door1',
            name: 'Entrée nord',
            image: 'door1.jpg',
            opened: false,
        },
        {
            id: 'door2',
            name: 'Entrée plage',
            image: 'door2.jpg',
            opened: false,
        },
        {
            id: 'door3',
            name: 'Vestibule',
            image: 'door3.jpg',
            opened: false,
        },
        {
            id: 'door4',
            name: 'Local technique',
            image: 'door4.jpg',
            opened: false,
        },
    ];

    public open(openData: OpenDoorVariables): Observable<OpenDoor['openDoor']> {
        return this.apollo
            .mutate<OpenDoor, OpenDoorVariables>({
                mutation: openDoorMutation,
                variables: openData,
            })
            .pipe(map(result => result.data!.openDoor));
    }
}
