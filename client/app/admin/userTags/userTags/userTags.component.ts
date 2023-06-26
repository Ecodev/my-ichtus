import {Component, OnInit} from '@angular/core';
import {AvailableColumn, NaturalAbstractList} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-user-tags',
    templateUrl: './userTags.component.html',
    styleUrls: ['./userTags.component.scss'],
})
export class UserTagsComponent extends NaturalAbstractList<UserTagService> implements OnInit {
    public override availableColumns: AvailableColumn[] = [
        {id: 'color', label: 'Couleur'},
        {id: 'name', label: 'Nom'},
    ];
    public constructor(userTagService: UserTagService, public readonly permissionsService: PermissionsService) {
        super(userTagService);
    }
}
