import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '@ecodev/natural/vanilla';
import {Bookables, BookablesVariables} from '../app/shared/generated-types';
import {bookablesQuery} from '../app/admin/bookables/services/bookable.queries';

/**
 * **DO NOT MODIFY UNLESS STRICTLY REQUIRED FOR VANILLA**
 *
 * This is a minimal service specialized for Vanilla and any modification,
 * including adding `import` in this file, might break https://navigations.ichtus.club.
 */
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
