import {Apollo} from 'apollo-angular';
import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {UserService} from './user.service';
import {Router} from '@angular/router';
import {mockApolloProvider} from '../../../shared/testing/MockApolloProvider';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {LOCAL_STORAGE, NaturalMemoryStorage} from '@ecodev/natural';

describe('UserService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                mockApolloProvider,
                {
                    provide: LOCAL_STORAGE,
                    useClass: NaturalMemoryStorage,
                },
            ],
        });

        // Mock permissions service
        inject([PermissionsService], (permissionsService: PermissionsService) => {
            permissionsService.setUser = () => null as any;
        })();
    });

    it('should get current user', fakeAsync(
        inject([UserService], (service: UserService) => {
            let actual: any = null;
            service.getViewer().subscribe(v => (actual = v));
            tick(1000);

            expect(actual.__typename).toBe('User');
        }),
    ));

    it('should login', fakeAsync(
        inject([UserService, Apollo], (service: UserService, apollo: Apollo) => {
            // Spy on resetStore
            const resetStore = spyOn(apollo.client, 'resetStore').and.callThrough();

            let actual: any = null;
            service
                .login({
                    login: 'foo',
                    password: 'bar',
                })
                .subscribe(v => (actual = v));
            tick(1000);

            expect(actual.__typename).toBe('User');
            expect(resetStore).toHaveBeenCalledTimes(1);
        }),
    ));

    it('should logout and redirect to /login', fakeAsync(
        inject([UserService, Apollo, Router], (service: UserService, apollo: Apollo, router: Router) => {
            // Spy on resetStore
            const resetStore = spyOn(apollo.client, 'resetStore').and.callThrough();

            // Mock router to do nothing when navigating
            const navigate = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));

            let actual: boolean | undefined;
            service.logout().subscribe(v => (actual = v));
            tick(1000);

            expect(actual).toBe(true);
            expect(resetStore).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(['/login'], {queryParams: {logout: true}});
        }),
    ));
});
