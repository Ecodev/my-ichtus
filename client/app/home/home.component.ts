import {Component, OnInit} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {NaturalAbstractController, NaturalSidenavContainerComponent, NaturalSidenavStackService} from '@ecodev/natural';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigurationService} from '../admin/configurations/services/configuration.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends NaturalAbstractController implements OnInit {
    public menu: NaturalSidenavContainerComponent | undefined;

    /**
     * Model for header code search
     */
    public code;

    public announcementActive = false;

    constructor(
        private userService: UserService,
        private router: Router,
        public route: ActivatedRoute,
        private configurationService: ConfigurationService,
        private readonly naturalSidenavStackService: NaturalSidenavStackService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.configurationService.get('announcement-active').subscribe(active => {
            if (!active) {
                return;
            }

            this.announcementActive = true;

            // Navigate/open announcement if last content is different from current one
            const announcementConfigKey = 'announcement-text';
            const announcementStoredValue = localStorage.getItem(announcementConfigKey);
            this.configurationService.get(announcementConfigKey).subscribe(announcementValue => {
                if (announcementValue !== announcementStoredValue) {
                    this.router.navigate(this.getAnnouncementLink());
                }
                localStorage.setItem(announcementConfigKey, announcementValue);
            });
        });

        this.naturalSidenavStackService.currentSidenav
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(sidenav => setTimeout(() => (this.menu = sidenav)));
    }

    public goToCode(): void {
        this.router.navigate(['/booking', this.code]);
    }

    public getAnnouncementLink(): any[] {
        return ['/', {outlets: {secondary: ['announcement']}}];
    }
}
