import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ConfigurationService} from '../services/configuration.service';
import {forkJoin} from 'rxjs';
import {
    NaturalAbstractController,
    NaturalAlertService,
    NaturalDialogTriggerProvidedData,
    NaturalFixedButtonComponent,
} from '@ecodev/natural';
import {finalize, takeUntil} from 'rxjs/operators';
import {MatButtonModule} from '@angular/material/button';
import {NaturalEditorComponent} from '@ecodev/natural-editor';
import {FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

export type SupportComponentData = {
    configurationKey: string;
    readonly?: boolean;
    showCloseButton?: boolean;
};

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrl: './support.component.scss',
    standalone: true,
    imports: [
        MatDialogModule,
        MatSlideToggleModule,
        FormsModule,
        NaturalEditorComponent,
        NaturalFixedButtonComponent,
        MatButtonModule,
    ],
})
export class SupportComponent extends NaturalAbstractController implements OnInit {
    public text = '';

    public readonly = false;

    /**
     * Specific to announcement
     */
    public active = false;

    /**
     * Specific to announcement
     */
    public activable = false;
    public updating = false;

    public constructor(
        private readonly configurationService: ConfigurationService,
        public readonly permissionsService: PermissionsService,
        public readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        @Optional()
        @Inject(MAT_DIALOG_DATA)
        public readonly data?: NaturalDialogTriggerProvidedData<SupportComponentData>,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.readonly = this.route.snapshot.data.readonly || (this.data?.data && this.data.data.readonly);
        this.configurationService
            .get(this.getConfigKey())
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => (this.text = value));

        this.activable = this.route.snapshot.data.activable; // ignore modal mode

        if (this.activable) {
            this.configurationService
                .get('announcement-active')
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(value => (this.active = value === '1'));
        }
    }

    public update(): void {
        const observables = [this.configurationService.set(this.getConfigKey(), this.text)];
        if (this.activable) {
            observables.push(this.configurationService.set('announcement-active', this.active ? '1' : '0'));
        }

        this.updating = true;
        forkJoin(observables)
            .pipe(finalize(() => (this.updating = false)))
            .subscribe(() => this.alertService.info('Mis à jour'));
    }

    private getConfigKey(): string {
        return this.data?.data?.configurationKey || this.route.snapshot.data.configurationKey;
    }
}
