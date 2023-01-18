import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {NaturalAbstractModelService, NaturalDebounceService} from '@ecodev/natural';
import {Logs, LogsVariables} from '../../../shared/generated-types';
import {logsQuery} from './log.queries';
import {Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LogService extends NaturalAbstractModelService<
    never,
    never,
    Logs['logs'],
    LogsVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'log', null, logsQuery, null, null, null);
    }

    public override getPartialVariablesForAll(): Observable<Partial<LogsVariables>> {
        return of({
            filter: {
                groups: [
                    {
                        conditions: [
                            {
                                message: {
                                    in: {
                                        not: true,
                                        values: [
                                            'login failed',
                                            'request password reset',
                                            'register',
                                            'update password failed',
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        });
    }
}
