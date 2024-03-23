import {Injectable} from '@angular/core';
import {FormAsyncValidators, FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {createLicense, deleteLicenses, licenseQuery, licensesQuery, updateLicense} from './license.queries';
import {
    CreateLicense,
    CreateLicenseVariables,
    DeleteLicenses,
    DeleteLicensesVariables,
    License,
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
    public constructor() {
        super('license', licenseQuery, licensesQuery, createLicense, updateLicense, deleteLicenses);
    }

    public override getDefaultForServer(): LicenseInput {
        return {
            name: '',
        };
    }

    public override getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
        };
    }

    public override getFormAsyncValidators(model: License['license']): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
