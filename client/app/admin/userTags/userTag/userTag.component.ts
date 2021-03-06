import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {UserTagService} from '../services/userTag.service';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-user-tag',
    templateUrl: './userTag.component.html',
    styleUrls: ['./userTag.component.scss'],
})
export class UserTagComponent extends NaturalAbstractDetail<UserTagService> {
    constructor(userTagService: UserTagService, injector: Injector, public readonly userService: UserService) {
        super('userTag', userTagService, injector);
    }
}
