import {Component, Input, OnInit} from '@angular/core';
import {
    AbstractControl,
    UntypedFormControl,
    UntypedFormGroup,
    FormGroupDirective,
    NgForm,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

function samePasswordsValidator(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof UntypedFormGroup)) {
        return null;
    }

    const password = formGroup.controls.password.value;
    const confirmPassword = formGroup.controls.confirmPassword.value;

    return password === confirmPassword ? null : {notSame: true};
}

class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        if (control && control.parent && control.parent instanceof UntypedFormGroup) {
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
    @Input() public form!: UntypedFormGroup;
    public confirmPasswordStateMatcher = new ConfirmPasswordStateMatcher();

    public constructor() {}

    public ngOnInit(): void {
        this.form.removeControl('password');
        this.form.addControl('password', new UntypedFormControl('', [Validators.required, Validators.minLength(12)]));
        this.form.addControl('confirmPassword', new UntypedFormControl(''));
        this.form.setValidators(samePasswordsValidator);
    }
}
