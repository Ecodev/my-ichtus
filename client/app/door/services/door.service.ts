import {Apollo} from 'apollo-angular';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {openDoorMutation} from './door.queries';
import {CurrentUserForProfile, Door, OpenDoor, OpenDoorVariables} from '../../shared/generated-types';

export type DoorConfig = {
    readonly id: keyof Pick<NonNullable<CurrentUserForProfile['viewer']>, 'door1' | 'door2' | 'door3' | 'door4'>;
    readonly enum: Door;
    readonly name: string;
    readonly image: string;
    opened: boolean;
};

@Injectable({
    providedIn: 'root',
})
export class DoorService {
    private readonly apollo = inject(Apollo);

    public readonly doors: DoorConfig[] = [
        {
            id: 'door1',
            enum: Door.Door1,
            name: 'Entrée nord',
            image: 'door1.jpg',
            opened: false,
        },
        {
            id: 'door2',
            enum: Door.Door2,
            name: 'Entrée plage',
            image: 'door2.jpg',
            opened: false,
        },
        {
            id: 'door3',
            enum: Door.Door3,
            name: 'Vestibule',
            image: 'door3.jpg',
            opened: false,
        },
        {
            id: 'door4',
            enum: Door.Door4,
            name: 'Local technique',
            image: 'door4.jpg',
            opened: false,
        },
    ] as const;

    public open(openData: OpenDoorVariables): Observable<OpenDoor['openDoor']> {
        return this.apollo
            .mutate<OpenDoor, OpenDoorVariables>({
                mutation: openDoorMutation,
                variables: openData,
            })
            .pipe(map(result => result.data!.openDoor));
    }
}
