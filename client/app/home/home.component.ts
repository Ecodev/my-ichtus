import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {
    LOCAL_STORAGE,
    NaturalAvatarComponent,
    NaturalIconDirective,
    NaturalSidenavContainerComponent,
    NaturalSidenavStackService,
} from '@ecodev/natural';
import {filter, switchMap} from 'rxjs/operators';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import {ConfigurationService} from '../admin/configurations/services/configuration.service';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatToolbar} from '@angular/material/toolbar';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-home',
    imports: [
        MatToolbar,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
        RouterLink,
        FormsModule,
        NaturalAvatarComponent,
        RouterOutlet,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly storage = inject(LOCAL_STORAGE);
    public readonly route = inject(ActivatedRoute);
    private readonly configurationService = inject(ConfigurationService);
    private readonly naturalSidenavStackService = inject(NaturalSidenavStackService);

    private readonly destroyRef = inject(DestroyRef);
    public menu: NaturalSidenavContainerComponent | undefined;

    /**
     * Model for header code search
     */
    public code = '';

    public announcementActive = false;

    public ngOnInit(): void {
        const announcementConfigKey = 'announcement-text';
        this.configurationService
            .get('announcement-active')
            .pipe(
                takeUntilDestroyed(this.destroyRef),
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(sidenav => setTimeout(() => (this.menu = sidenav)));
    }

    public goToCode(): void {
        this.router.navigate(['/booking', this.code]);
    }

    public getAnnouncementLink(): any[] {
        return ['/', {outlets: {secondary: ['announcement']}}];
    }
}
