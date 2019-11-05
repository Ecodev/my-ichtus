import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { ConfigurationService } from '../services/configuration.service';

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

    constructor(private configurationService: ConfigurationService,
                public permissionsService: PermissionsService,
                public route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.configurationService.get('support-text').subscribe(value => this.text = value);
    }

    public update() {
        this.configurationService.set('support-text', this.text);
    }

}
