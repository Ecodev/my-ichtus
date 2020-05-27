import {Component, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
    constructor(public permissionsService: PermissionsService) {}

    public ngOnInit(): void {}
}
