import {Component} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLink, RouterOutlet} from '@angular/router';
import {UserRole} from '../../shared/generated-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatListModule} from '@angular/material/list';
import {NgIf} from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {
    NaturalSidenavContainerComponent,
    NaturalSidenavComponent,
    NaturalSidenavContentComponent,
} from '@ecodev/natural';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [
        NaturalSidenavContainerComponent,
        FlexModule,
        NaturalSidenavComponent,
        MatExpansionModule,
        NgIf,
        MatListModule,
        RouterLinkActive,
        RouterLink,
        NaturalSidenavContentComponent,
        RouterOutlet,
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
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));

            this.adminBookableRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'bookable' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));

            this.adminBookingRouteActive =
                segments[0]?.path === 'admin' &&
                segments[1]?.path === 'booking' &&
                (segments[2] === undefined || segments[2].path === 'new' || !!segments[2].path.match(/^\d+$/));
        });
    }
}
