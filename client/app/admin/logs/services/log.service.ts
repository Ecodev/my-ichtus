import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {Logs, LogsVariables} from '../../../shared/generated-types';
import {logsQuery} from './log.queries';

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
    constructor(apollo: Apollo) {
        super(apollo, 'log', null, logsQuery, null, null, null);
    }

    public getPartialVariablesForAll(): Partial<LogsVariables> {
        return {
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
        };
    }
}
