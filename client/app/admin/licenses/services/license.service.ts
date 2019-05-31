import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {NaturalAbstractModelService, FormValidators, FormAsyncValidators, NaturalValidators} from '@ecodev/natural';
import { createLicense, deleteLicenses, licenseQuery, licensesQuery, updateLicense } from './license.queries';
import {
    CreateLicense,
    CreateLicenseVariables,
    LicenseInput,
    License,
    LicenseVariables,
    Licenses,
    LicensesVariables,
    UpdateLicense,
    UpdateLicenseVariables,
} from '../../../shared/generated-types';
import { Validators } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class LicenseService extends NaturalAbstractModelService<License['license'],
    LicenseVariables,
    Licenses['licenses'],
    LicensesVariables,
    CreateLicense['createLicense'],
    CreateLicenseVariables,
    UpdateLicense['updateLicense'],
    UpdateLicenseVariables,
    any> {

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

    public getFormAsyncValidators(): FormAsyncValidators {
        return {
            name: [NaturalValidators.unique('name', this)],
        };
    }

}
