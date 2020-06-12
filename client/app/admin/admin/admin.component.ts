import {Component, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../users/services/user.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
    public UserService = UserService;

    constructor(public permissionsService: PermissionsService, public route: ActivatedRoute) {}

    public ngOnInit(): void {}
}
