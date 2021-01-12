import {AbstractControl, ValidationErrors} from '@angular/forms';
import {extractIBAN, isSEPACountry} from 'ibantools';

function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}

/**
 * Validate that given string is a valid IBAN for SEPA countries
 */
export function iban(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (isEmptyInputValue(value)) {
        return null; // don't validate empty values to allow optional controls
    }

    if (typeof value === 'string') {
        // Our API accept whitespaces, so we remove them before validating
        const result = extractIBAN(value.replace(/ /g, ''));

        if (result.valid && result.countryCode && isSEPACountry(result.countryCode)) {
            return null;
        }
    }

    return {iban: true};
}
