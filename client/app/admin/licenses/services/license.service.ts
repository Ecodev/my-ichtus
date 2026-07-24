import {Injectable} from '@angular/core';
import {type FormAsyncValidators, type FormValidators, NaturalAbstractModelService, unique} from '@ecodev/natural';
import {createLicense, deleteLicenses, licenseQuery, licensesQuery, updateLicense} from './license.queries';
import {
    type CreateLicense,
    type CreateLicenseVariables,
    type DeleteLicenses,
    type DeleteLicensesVariables,
    type LicenseInput,
    type LicenseQuery,
    type LicenseQueryVariables,
    type LicensesQuery,
    type LicensesQueryVariables,
    type UpdateLicense,
    type UpdateLicenseVariables,
} from '../../../shared/generated-types';
import {Validators} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class LicenseService extends NaturalAbstractModelService<
    LicenseQuery['license'],
    LicenseQueryVariables,
    LicensesQuery['licenses'],
    LicensesQueryVariables,
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

    public override getFormAsyncValidators(model: LicenseQuery['license']): FormAsyncValidators {
        return {
            name: [unique('name', model.id, this)],
        };
    }
}
