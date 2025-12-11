import {Component, inject} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {UserRole} from '../../shared/generated-types';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatListItem, MatNavList} from '@angular/material/list';
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import {
    NaturalSidenavComponent,
    NaturalSidenavContainerComponent,
    NaturalSidenavContentComponent,
} from '@ecodev/natural';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-admin',
    imports: [
        NaturalSidenavContainerComponent,
        NaturalSidenavComponent,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatNavList,
        MatListItem,
        RouterLinkActive,
        RouterLink,
        NaturalSidenavContentComponent,
        RouterOutlet,
        AsyncPipe,
    ],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss',
})
export class AdminComponent {
    protected readonly permissionsService = inject(PermissionsService);
    protected readonly route = inject(ActivatedRoute);

    protected adminUserRouteActive = false;
    protected adminBookableRouteActive = false;
    protected adminBookingRouteActive = false;
    protected readonly UserRole = UserRole;

    public constructor() {
        const router = inject(Router);

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
