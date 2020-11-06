import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {FormAsyncValidators, FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {createLicense, deleteLicenses, licenseQuery, licensesQuery, updateLicense} from './license.queries';
import {
    CreateLicense,
    CreateLicenseVariables,
    DeleteLicenses,
    DeleteLicensesVariables,
    License,
    License_license,
    LicenseInput,
    Licenses,
    LicensesVariables,
    LicenseVariables,
    UpdateLicense,
    UpdateLicenseVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class LicenseService extends NaturalAbstractModelService<
    License['license'],
    LicenseVariables,
    Licenses['licenses'],
    LicensesVariables,
    CreateLicense['createLicense'],
    CreateLicenseVariables,
    UpdateLicense['updateLicense'],
    UpdateLicenseVariables,
    DeleteLicenses,
    DeleteLicensesVariables
> {
    constructor(apollo: Apollo) {
        super(apollo, 'license', licenseQuery, licensesQuery, createLicense, updateLicense, deleteLicenses);
    }

    protected getDefaultForServer(): LicenseInput {
        return {
            name: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }

    public getFormAsyncValidators(model: License_license): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
