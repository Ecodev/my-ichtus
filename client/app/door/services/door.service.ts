import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { pick } from 'lodash';
import { Literal } from '../../shared/types';
import {
    openDoorMutation
} from './door.queries';
import {
    OpenDoor,
    Door, OpenDoorVariables
} from '../../shared/generated-types';

@Injectable({
    providedIn: 'root',
})
export class DoorService {

    constructor(private apollo: Apollo) {}

    public doors: Literal = [
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

        return this.apollo.mutate<OpenDoor, OpenDoorVariables>({
            mutation: openDoorMutation,
            variables: openData,
        }).pipe(map(({data: {openDoor}}) => openDoor));
    }
}
