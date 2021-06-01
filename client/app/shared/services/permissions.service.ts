import {Apollo, gql} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, skip, take} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {
    CurrentUserForProfile,
    Permissions,
    Permissions_permissions,
    Permissions_permissions_crud,
    UserRole,
    UserStatus,
} from '../generated-types';
import {Literal} from '@ecodev/natural';

const permissions = gql`
    query Permissions {
        permissions {
            crud {
                account {
                    create
                }
                accountingDocument {
                    create
                }
                bookable {
                    create
                }
                bookableMetadata {
                    create
                }
                bookableTag {
                    create
                }
                booking {
                    create
                }
                country {
                    create
                }
                expenseClaim {
                    create
                }
                image {
                    create
                }
                license {
                    create
                }
                message {
                    create
                }
                transaction {
                    create
                }
                transactionTag {
                    create
                }
                user {
                    create
                }
                userTag {
                    create
                }
                configuration {
                    create
                }
            }
        }
    }
`;

interface Contexts {
    user: string | null;
}

/**
 * A service to fetch permissions and use them in templates.
 *
 * Current site and state will be automatically taken into account when they change.
 * The other contexts must be set manually, when available, to get correct permissions.
 */
@Injectable({
    providedIn: 'root',
})
export class PermissionsService {
    /**
     * CRUD permissions, usually for object creations
     */
    public crud: Permissions_permissions_crud | null = null;

    /**
     * Observable of changed permissions. Here we use a ReplaySubject so that new subscriber will get
     * the most recent available permissions (useful in route guard)
     */
    public changes = new ReplaySubject<Permissions_permissions>(1);

    private readonly currentContexts = new BehaviorSubject<Contexts>({
        user: null,
    });

    constructor(apollo: Apollo) {
        // Query the API when our variables changed
        this.currentContexts.pipe(distinctUntilChanged(isEqual), debounceTime(5)).subscribe(contexts => {
            // Fetch global permissions
            apollo
                .query<Permissions>({
                    query: permissions,
                })
                .pipe(filter(result => !result.loading))
                .subscribe(result => {
                    this.crud = result.data.permissions.crud;
                    this.changes.next(result.data.permissions);
                });
        });
    }

    /**
     * Return an observable that will complete as soon as the next permissions are available
     */
    private setNewContexts(newContexts: Contexts): Observable<Permissions_permissions> {
        if (isEqual(this.currentContexts.value, newContexts) && this.crud) {
            return of({
                __typename: 'AllPermissions',
                crud: this.crud,
            });
        } else {
            this.currentContexts.next(newContexts);

            return this.changes.pipe(skip(1), take(1));
        }
    }

    public setUser(user: Literal | null): Observable<Permissions_permissions> {
        const newContexts = {
            user: user ? user.id : null,
        };

        return this.setNewContexts(newContexts);
    }

    public canAccessUsers(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [
            UserRole.individual,
            UserRole.member,
            UserRole.member,
            UserRole.responsible,
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
            UserRole.member,
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

        return [UserStatus.active, UserStatus.new].includes(user.status);
    }

    public canAccessAdmin(user: CurrentUserForProfile['viewer']): boolean {
        if (!user) {
            return false;
        }

        return [
            UserRole.accounting_verificator,
            UserRole.trainer,
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
}
