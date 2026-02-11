import {Injectable} from '@angular/core';
import {countriesQuery, countryQuery} from './country.queries';
import {CountriesQuery, CountriesQueryVariables, CountryQuery, CountryQueryVariables} from '../../generated-types';
import {NaturalAbstractModelService} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class CountryService extends NaturalAbstractModelService<
    CountryQuery['country'],
    CountryQueryVariables,
    CountriesQuery['countries'],
    CountriesQueryVariables,
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
