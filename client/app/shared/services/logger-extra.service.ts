import {inject, Injectable} from '@angular/core';
import {type NaturalLoggerExtra, type NaturalLoggerType} from '@ecodev/natural';
import {type Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserService} from '../../admin/users/services/user.service';
import {localConfig} from '../generated-config';

@Injectable({
    providedIn: 'root',
})
export class LoggerExtraService implements NaturalLoggerExtra {
    private readonly userService = inject(UserService);

    public getExtras(): Observable<Partial<NaturalLoggerType>> {
        return this.userService.getViewer().pipe(
            map(viewer => {
                return {
                    viewer: viewer?.login,
                    app: {
                        version: localConfig.version,
                    },
                };
            }),
        );
    }
}
