import {Component} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLink, RouterOutlet} from '@angular/router';
import {UserRole} from '../../shared/generated-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {
    NaturalSidenavContainerComponent,
    NaturalSidenavComponent,
    NaturalSidenavContentComponent,
} from '@ecodev/natural';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss',
    standalone: true,
    imports: [
        NaturalSidenavContainerComponent,
        NaturalSidenavComponent,
        MatExpansionModule,
        MatListModule,
        RouterLinkActive,
        RouterLink,
        NaturalSidenavContentComponent,
        RouterOutlet,
        AsyncPipe,
    ],
})
export class AdminComponent {
    public adminUserRouteActive = false;
    public adminBookableRouteActive = false;
    public adminBookingRouteActive = false;
    public UserRole = UserRole;

    public constructor(
        router: Router,
        public readonly permissionsService: PermissionsService,
        public readonly route: ActivatedRoute,
    ) {
        // Update active route status
        router.events.pipe(takeUntilDestroyed()).subscribe(e => {
            if (!(e instanceof NavigationEnd)) {
                return;
            }

            // Unfortunately because /admin/user, /admin/user/newcomer, /admin/user/member and /admin/user/non-active
            // all share the same start of URL we cannot rely on standard routerLinkActive and must carefully check
            // that our admin user route is active. Otherwise we would have two menu entries as active
            const tree = router.parseUrl(router.url);
            const segments = tree.root.children.primary?.segments ?? [];
            this.adminUserRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'user' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!/^\d+$/.exec(segments[2].path));

            this.adminBookableRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'bookable' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!/^\d+$/.exec(segments[2].path));

            this.adminBookingRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'booking' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!/^\d+$/.exec(segments[2].path));
        });
    }
}
