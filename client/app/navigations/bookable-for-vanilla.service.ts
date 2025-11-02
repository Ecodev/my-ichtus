import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {Bookables, BookablesVariables} from '../shared/generated-types';
import {bookablesQuery} from '../admin/bookables/services/bookable.queries';

@Injectable({
    providedIn: 'root',
})
export class BookableForVanillaService extends NaturalAbstractModelService<
    never,
    never,
    Bookables['bookables'],
    BookablesVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor() {
        super('bookable', null, bookablesQuery, null, null, null);
    }
}
