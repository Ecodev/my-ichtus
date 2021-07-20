import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ConfigurationService} from '../services/configuration.service';
import {forkJoin} from 'rxjs';
import {NaturalAlertService} from '@ecodev/natural';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {
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

    constructor(
        private readonly configurationService: ConfigurationService,
        public readonly permissionsService: PermissionsService,
        public readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        @Optional() @Inject(MAT_DIALOG_DATA) public readonly data?: any,
    ) {}

    public ngOnInit(): void {
        this.readonly = this.route.snapshot.data.readonly || (this.data && this.data.readonly);
        this.configurationService.get(this.getConfigKey()).subscribe(value => (this.text = value));

        this.activable = this.route.snapshot.data.activable; // ignore modal mode

        if (this.activable) {
            this.configurationService.get('announcement-active').subscribe(value => (this.active = value === '1'));
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
        return (this.data && this.data.configurationKey) || this.route.snapshot.data.configurationKey;
    }
}
