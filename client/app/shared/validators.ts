import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {Observable, of, timer} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {extractIBAN, isSEPACountry} from 'ibantools';

function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}

/**
 * Returns an async validator function that checks that the form control value is available
 * Unlike natural's unique validator, allows to use a custom query for when the client does
 * not have permissions for modelService.count
 */
export function available(
    getAvailableQuery: (value: string, excludedId: string | null) => Observable<boolean>,
    excludedId: string | null = null,
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value || !control.dirty) {
            return of(null);
        }

        return timer(500).pipe(
            switchMap(() =>
                getAvailableQuery(control.value, excludedId).pipe(
                    map(isAvailable => (isAvailable ? null : {duplicateValue: true})),
                ),
            ),
        );
    };
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
