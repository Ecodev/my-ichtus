import {Injectable, OnDestroy} from '@angular/core';
import {NaturalLoggerExtra, NaturalLoggerType} from '@ecodev/natural';
import {Observable, of, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {CurrentUserForProfile} from '../generated-types';
import {UserService} from '../../admin/users/services/user.service';

@Injectable({
    providedIn: 'root',
})
export class LoggerExtraService implements NaturalLoggerExtra {
    public constructor(private readonly userService: UserService) {}

    public getExtras(error: unknown): Observable<Partial<NaturalLoggerType>> {
        return this.userService.getViewer().pipe(
            map(viewer => {
                return {viewer: viewer?.login};
            }),
        );
    }
}
