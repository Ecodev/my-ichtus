import {Apollo} from 'apollo-angular';
import {NetworkStatus} from '@apollo/client/core';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Configuration} from '../../../shared/generated-types';
import {configurationQuery, updateConfiguration} from './configuration.queries';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    constructor(private apollo: Apollo) {}

    public get(key: string): Observable<string> {
        const resultObservable = new Subject<string>();

        const queryRef = this.apollo.watchQuery<Configuration>({
            query: configurationQuery,
            variables: {key},
            fetchPolicy: 'cache-and-network',
        });

        const subscription = queryRef.valueChanges.pipe(filter(r => !!r.data)).subscribe(result => {
            const data = result.data['configuration'];
            resultObservable.next(data);
            if (result.networkStatus === NetworkStatus.ready) {
                resultObservable.complete();
                subscription.unsubscribe();
            }
        });

        return resultObservable.asObservable();
    }

    public set(key: string, value: string): void {
        this.apollo
            .mutate({
                mutation: updateConfiguration,
                variables: {key, value},
            })
            .subscribe();
    }
}
