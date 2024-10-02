import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Literal} from '@ecodev/natural';
import {BehaviorSubject, Observable} from 'rxjs';
import {concatMap, debounceTime, distinctUntilChanged, filter, map, shareReplay} from 'rxjs/operators';
import {CurrentUserForProfile, Permissions, UserRole, UserStatus} from '../generated-types';
import {isEqual} from 'lodash-es';
import {permissionsQuery} from './permissions.queries';

type Contexts = {
    user: string | null;
};

/**
 * A service to fetch permissions and use them in templates.
 */
@Injectable({
    providedIn: 'root',
})
export class PermissionsService {
    /**
     * Observable of CRUD permissions, usually for object creations
     */
    public readonly crud: Observable<Permissions['permissions']['crud']>;

    /**
     * Observable of changed permissions
     */
    public readonly changes: Observable<Permissions['permissions']>;

    private readonly currentContexts = new BehaviorSubject<Contexts>({
        user: null,
    });

    public constructor(apollo: Apollo) {
        // Query the API whenever our variables change
        const fetch = this.currentContexts.pipe(
            distinctUntilChanged(isEqual),
            debounceTime(5),
            concatMap(() =>
                apollo.query<Permissions>({query: permissionsQuery}).pipe(filter(result => !result.loading)),
            ),
            shareReplay(), // new subscriber will get the most recent available permissions
        );

        this.crud = fetch.pipe(map(result => result.data.permissions.crud));
        this.changes = fetch.pipe(map(result => result.data.permissions));
    }

    /**
     * Return an observable that will complete as soon as the next permissions are available
     */
    private setNewContexts(newContexts: Contexts): void {
        this.currentContexts.next(newContexts);
    }

    public setUser(user: Literal | null): void {
        const newContexts = {
            user: user ? user.id : null,
        };

        this.setNewContexts(newContexts);
    }

    public canAccessUsers(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [
            UserRole.individual,
            UserRole.member,
            UserRole.responsible,
            UserRole.formation_responsible,
            UserRole.administrator,
        ].includes(user.role);
    }

    public canAccessNavigations(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [
            UserRole.individual,
            UserRole.member,
            UserRole.trainer,
            UserRole.formation_responsible,
            UserRole.responsible,
            UserRole.administrator,
        ].includes(user.role);
    }

    public canAccessAccounting(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return this.gteResponsible(user) || user.role === UserRole.accounting_verificator;
    }

    public canAccessFormations(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return (
            this.gteResponsible(user) || user.role === UserRole.trainer || user.role === UserRole.formation_responsible
        );
    }

    public canAccessNFT(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return this.gteResponsible(user);
    }

    public canAccessFormationApplication(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return this.gteResponsible(user) || user.role === UserRole.formation_responsible;
    }

    public canAccessBookable(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return this.gteResponsible(user);
    }

    public canAccessExpenseClaims(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [UserRole.responsible, UserRole.administrator].includes(user.role);
    }

    public canAccessServices(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [UserStatus.Active, UserStatus.New].includes(user.status);
    }

    public canAccessAdmin(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [
            UserRole.accounting_verificator,
            UserRole.trainer,
            UserRole.formation_responsible,
            UserRole.responsible,
            UserRole.administrator,
        ].includes(user.role);
    }

    public canAccessDoor(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return user.canOpenDoor;
    }

    /**
     * Return true if user role is greater or equal to responsible
     */
    public gteResponsible(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [UserRole.responsible, UserRole.administrator].includes(user.role);
    }

    /**
     * Return true if user role is administrator
     */
    public isAdministrator(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return user.role === UserRole.administrator;
    }
}
