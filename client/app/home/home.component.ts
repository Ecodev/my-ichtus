import {Component, Inject, OnInit} from '@angular/core';
import {UserService} from '../admin/users/services/user.service';
import {
    LOCAL_STORAGE,
    NaturalAbstractController,
    NaturalSidenavContainerComponent,
    NaturalSidenavStackService,
    NaturalStorage,
    NaturalIconDirective,
    NaturalAvatarComponent,
} from '@ecodev/natural';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import {ConfigurationService} from '../admin/configurations/services/configuration.service';
import {FormsModule} from '@angular/forms';
import {ExtendedModule} from '@ngbracket/ngx-layout/extended';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        MatToolbarModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        RouterLink,
        ExtendedModule,
        FormsModule,
        NaturalAvatarComponent,
        RouterOutlet,
    ],
})
export class HomeComponent extends NaturalAbstractController implements OnInit {
    public menu: NaturalSidenavContainerComponent | undefined;

    /**
     * Model for header code search
     */
    public code = '';

    public announcementActive = false;

    public constructor(
        private readonly userService: UserService,
        private readonly router: Router,
        @Inject(LOCAL_STORAGE) private readonly storage: NaturalStorage,
        public readonly route: ActivatedRoute,
        private readonly configurationService: ConfigurationService,
        private readonly naturalSidenavStackService: NaturalSidenavStackService,
    ) {
        super();
    }

    public ngOnInit(): void {
        const announcementConfigKey = 'announcement-text';
        this.configurationService
            .get('announcement-active')
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(active => !!active),
                switchMap(() => {
                    this.announcementActive = true;

                    return this.configurationService.get(announcementConfigKey);
                }),
            )
            .subscribe(announcementValue => {
                // Open announcement if last shown content is different from current one
                const announcementStoredValue = this.storage.getItem(announcementConfigKey);
                if (announcementValue !== announcementStoredValue) {
                    this.router.navigate(this.getAnnouncementLink());
                }
                this.storage.setItem(announcementConfigKey, announcementValue);
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
