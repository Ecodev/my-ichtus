import {Component} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {NaturalAbstractController} from '@ecodev/natural';
import {takeUntil} from 'rxjs/operators';
import {UserRole} from '../../shared/generated-types';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent extends NaturalAbstractController {
    public adminUserRouteActive = false;
    public adminBookableRouteActive = false;
    public adminBookingRouteActive = false;
    public UserRole = UserRole;

    public constructor(
        router: Router,
        public readonly permissionsService: PermissionsService,
        public readonly route: ActivatedRoute,
    ) {
        super();

        // Update active route status
        router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(e => {
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
