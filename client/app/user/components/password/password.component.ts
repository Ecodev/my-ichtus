import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NaturalFormControl } from '@ecodev/natural';

function samePasswordsValidator(formGroup: FormGroup): ValidationErrors | null {
    if (!formGroup || !formGroup.controls) {
        return null;
    }

    const password = formGroup.controls.password.value;
    const confirmPassword = formGroup.controls.confirmPassword.value;

    return password === confirmPassword ? null : {notSame: true};
}

class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {

        if (control && control.parent && control.parent instanceof FormGroup) {
            return !!samePasswordsValidator(control.parent) && control.dirty;
        }

        return false;
    }
}

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
})
export class PasswordComponent implements OnInit {
    @Input() form: FormGroup;
    public confirmPasswordStateMatcher = new ConfirmPasswordStateMatcher();

    constructor() {

    }

    ngOnInit() {
        this.form.removeControl('password');
        this.form.addControl('password', new NaturalFormControl('', [Validators.required, Validators.minLength(12)]));
        this.form.addControl('confirmPassword', new NaturalFormControl(''));
        this.form.setValidators(samePasswordsValidator);
    }

}
