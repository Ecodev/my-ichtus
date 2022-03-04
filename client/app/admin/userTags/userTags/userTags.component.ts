import {Component, Injector, OnInit} from '@angular/core';
import {NaturalAbstractList} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {PermissionsService} from '../../../shared/services/permissions.service';

@Component({
    selector: 'app-user-tags',
    templateUrl: './userTags.component.html',
    styleUrls: ['./userTags.component.scss'],
})
export class UserTagsComponent extends NaturalAbstractList<UserTagService> implements OnInit {
    public constructor(
        userTagService: UserTagService,
        injector: Injector,
        public readonly permissionsService: PermissionsService,
    ) {
        super(userTagService, injector);
    }
}
