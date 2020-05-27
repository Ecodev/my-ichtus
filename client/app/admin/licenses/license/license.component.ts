import {Component, Injector} from '@angular/core';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {
    CreateLicense,
    CreateLicenseVariables,
    DeleteLicenses,
    License,
    LicenseVariables,
    UpdateLicense,
    UpdateLicenseVariables,
} from '../../../shared/generated-types';
import {LicenseService} from '../services/license.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {UserService} from '../../users/services/user.service';

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
})
export class LicenseComponent extends NaturalAbstractDetail<
    License['license'],
    LicenseVariables,
    CreateLicense['createLicense'],
    CreateLicenseVariables,
    UpdateLicense['updateLicense'],
    UpdateLicenseVariables,
    DeleteLicenses
> {
    constructor(
        licenseService: LicenseService,
        injector: Injector,
        public userService: UserService,
        public bookableService: BookableService,
    ) {
        super('license', licenseService, injector);
    }
}
