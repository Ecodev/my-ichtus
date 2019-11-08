import { Component, OnInit } from '@angular/core';
import { UserService } from '../admin/users/services/user.service';
import { NaturalAbstractController, NaturalSidenavContainerComponent, NaturalSidenavService } from '@ecodev/natural';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService } from '../admin/configurations/services/configuration.service';

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

    constructor(private userService: UserService,
                private router: Router,
                public route: ActivatedRoute,
                private configurationService: ConfigurationService) {
        super();
    }

    ngOnInit() {

        // Navigate/open announcement if last content is different from current one
        const announcementConfigKey = 'announcement-text';
        const announcementStoredValue = localStorage.getItem(announcementConfigKey);
        this.configurationService.get(announcementConfigKey).subscribe(announcementValue => {
            if (announcementValue !== announcementStoredValue) {
                this.router.navigate(this.getAnnouncementLink());
            }
            localStorage.setItem(announcementConfigKey, announcementValue);
        });

        NaturalSidenavService.sideNavsChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            setTimeout(() => {
                this.menu = NaturalSidenavService.sideNavs.get('adminMenu') || NaturalSidenavService.sideNavs.get('profileMenu');
            });
        });
    }

    public goToCode() {
        this.router.navigate(['/booking', this.code]);
    }

    public getAnnouncementLink(): any[] {
        return ['/', {outlets: {secondary: ['announcement']}}];
    }

}
