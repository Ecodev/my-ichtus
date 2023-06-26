import {Component} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {LicenseService} from '../services/license.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
})
export class LicenseComponent extends NaturalAbstractDetail<LicenseService> {
    public constructor(
        licenseService: LicenseService,
        public readonly userService: UserService,
        public readonly bookableService: BookableService,
    ) {
        super('license', licenseService);
    }
}
