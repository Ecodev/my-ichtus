import {FormControl, type ValidatorFn} from '@angular/forms';
import {iban} from './validators';
import type {ValidationErrorsWithMessage} from '@ecodev/natural';

function validate(validatorFn: ValidatorFn, value: unknown, expected: ValidationErrorsWithMessage | null): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    const expectValid = expected === null;
    expect(control.valid)
        .withContext(JSON.stringify(value) + ' should be ' + (expected ? 'valid' : 'invalid'))
        .toBe(expectValid);
    expect(control.errors).withContext(JSON.stringify(value)).toEqual(expected);
}

describe('iban', () => {
    it('should validate IBAN', () => {
        validate(iban, 'CH8589144971834589944', null);
    });

    it('should validate formatted IBAN', () => {
        validate(iban, 'CH85 8914 4971 8345 8994 4', null);
    });

    it('should validate weirdly formatted IBAN', () => {
        validate(iban, '   D E  9 3 5 0 0 1   05 1 7 9 98 67 78 92 4    ', null);
    });

    it('should not validate non-SEPA countries', () => {
        const error: ValidationErrorsWithMessage = {
            iban: {
                message: `IBAN invalide`,
            },
        };

        validate(iban, 'SN68Y23411897738779716761865', error);
    });
});
