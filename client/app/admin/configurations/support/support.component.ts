import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ConfigurationService} from '../services/configuration.service';
import {forkJoin} from 'rxjs';
import {NaturalAlertService, NaturalDialogTriggerProvidedData, NaturalFixedButtonComponent} from '@ecodev/natural';
import {finalize} from 'rxjs/operators';
import {MatButtonModule} from '@angular/material/button';
import {NaturalEditorComponent} from '@ecodev/natural-editor';
import {FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AsyncPipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
        AsyncPipe,
    ],
})
export class SupportComponent implements OnInit {
    private readonly configurationService = inject(ConfigurationService);
    public readonly permissionsService = inject(PermissionsService);
    public readonly route = inject(ActivatedRoute);
    private readonly alertService = inject(NaturalAlertService);
    public readonly data? = inject<NaturalDialogTriggerProvidedData<SupportComponentData>>(MAT_DIALOG_DATA, {
        optional: true,
    });

    private readonly destroyRef = inject(DestroyRef);
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

    public ngOnInit(): void {
        this.readonly = this.route.snapshot.data.readonly || this.data?.data?.readonly;
        this.configurationService
            .get(this.getConfigKey())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => (this.text = value));

        this.activable = this.route.snapshot.data.activable; // ignore modal mode

        if (this.activable) {
            this.configurationService
                .get('announcement-active')
                .pipe(takeUntilDestroyed(this.destroyRef))
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
