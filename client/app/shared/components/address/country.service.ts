import {Injectable} from '@angular/core';
import {countriesQuery, countryQuery} from './country.queries';
import {Countries, CountriesVariables, Country, CountryVariables} from '../../generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class CountryService extends NaturalAbstractModelService<
    Country['country'],
    CountryVariables,
    Countries['countries'],
    CountriesVariables,
    null,
    {input: Record<string, never>},
    null,
    {id: string; input: Record<string, never>},
    never,
    never
> {
    public constructor() {
        super('country', countryQuery, countriesQuery, null, null, null);
    }
}
