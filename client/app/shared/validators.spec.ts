import {FormControl, ValidatorFn} from '@angular/forms';
import {iban} from './validators';

function validate(validatorFn: ValidatorFn, expected: boolean, value: any): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    expect(control.valid)
        .withContext(JSON.stringify(value) + ' should be ' + (expected ? 'valid' : 'invalid'))
        .toBe(expected);
}

describe('iban', () => {
    it('should validate IBAN', () => {
        validate(iban, true, 'CH8589144971834589944');
    });

    it('should validate formatted IBAN', () => {
        validate(iban, true, 'CH85 8914 4971 8345 8994 4');
    });

    it('should validate weirdly formatted IBAN', () => {
        validate(iban, true, '   D E  9 3 5 0 0 1   05 1 7 9 98 67 78 92 4    ');
    });

    it('should not validate non-SEPA countries', () => {
        validate(iban, false, 'SN68Y23411897738779716761865');
    });
});
