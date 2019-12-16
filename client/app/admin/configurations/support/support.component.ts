import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { ConfigurationService } from '../services/configuration.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {

    public tinyInit = {
        menubar: false,
        inline: true,
        plugins: 'link code lists',
        toolbar: 'undo redo | p h1 h2 | quicklink | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link unlink | removeformat | code ',
        extended_valid_elements: ['h1[class="mat-display-4"]'],
    };

    public text;

    public readonly = false;

    /**
     * Specific to announcement
     */
    public active = false;

    /**
     * Specific to announcement
     */
    public activable = false;

    constructor(private configurationService: ConfigurationService,
                public permissionsService: PermissionsService,
                public route: ActivatedRoute,
                @Optional() @Inject(MAT_DIALOG_DATA) private data?: any) {
    }

    public ngOnInit(): void {
        this.readonly = this.route.snapshot.data.readonly || this.data && this.data.readonly;
        this.configurationService.get(this.getConfigKey()).subscribe(value => this.text = value);

        this.activable = this.route.snapshot.data.activable; // ignore modal mode

        if (this.activable) {
            this.configurationService.get('announcement-active').subscribe(value => this.active = value === '1');
        }
    }

    public update() {
        this.configurationService.set(this.getConfigKey(), this.text);
        this.configurationService.set('announcement-active', this.active ? '1' : '0');
    }

    private getConfigKey(): string {
        return this.data && this.data.configurationKey || this.route.snapshot.data.configurationKey;
    }

}
