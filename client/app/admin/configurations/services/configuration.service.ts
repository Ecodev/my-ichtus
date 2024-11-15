import {Apollo} from 'apollo-angular';
import {NetworkStatus} from '@apollo/client/core';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, takeWhile} from 'rxjs/operators';
import {
    Configuration,
    ConfigurationVariables,
    UpdateConfiguration,
    UpdateConfigurationVariables,
} from '../../../shared/generated-types';
import {configurationQuery, updateConfiguration} from './configuration.queries';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    private readonly apollo = inject(Apollo);

    public get(key: string): Observable<string> {
        const queryRef = this.apollo.watchQuery<Configuration, ConfigurationVariables>({
            query: configurationQuery,
            variables: {key},
            fetchPolicy: 'cache-and-network',
        });

        return queryRef.valueChanges.pipe(
            filter(result => !!result.data),
            takeWhile(result => result.networkStatus !== NetworkStatus.ready, true),
            map(result => result.data.configuration),
            distinctUntilChanged(),
        );
    }

    public set(key: string, value: string): Observable<string> {
        return this.apollo
            .mutate<UpdateConfiguration, UpdateConfigurationVariables>({
                mutation: updateConfiguration,
                variables: {key, value},
            })
            .pipe(map(result => result.data!.updateConfiguration));
    }
}
