import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '@ecodev/natural';
import {from, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {
    CurrentUserForProfile,
    Login,
    LoginVariables,
    User,
    Users,
    UsersVariables,
    UserVariables,
} from '../shared/generated-types';
import {currentUserForProfileQuery, loginMutation, userQuery, usersQuery} from '../admin/users/services/user.queries';

@Injectable({
    providedIn: 'root',
})
export class UserForVanillaService extends NaturalAbstractModelService<
    User['user'],
    UserVariables,
    Users['users'],
    UsersVariables,
    never,
    never,
    never,
    never,
    never,
    never
> {
    public constructor() {
        super('user', userQuery, usersQuery, null, null, null);
    }

    public login(loginData: LoginVariables): Observable<Login['login']> {
        // Be sure to destroy all Apollo data, before changing user
        return from(this.apollo.client.resetStore()).pipe(
            switchMap(() =>
                this.apollo
                    .mutate<Login, LoginVariables>({
                        mutation: loginMutation,
                        variables: loginData,
                    })
                    .pipe(map(result => result.data!.login)),
            ),
        );
    }

    public getViewer(): Observable<CurrentUserForProfile['viewer']> {
        return this.apollo
            .query<CurrentUserForProfile>({
                query: currentUserForProfileQuery,
            })
            .pipe(map(result => result.data.viewer));
    }
}
