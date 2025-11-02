import type {ServerType} from '../types';

export let server: ServerType;

export function serverInitialize(theServer: ServerType): void {
    server = theServer;
}
