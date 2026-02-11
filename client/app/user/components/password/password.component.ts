import {NaturalErrorMessagePipe, NaturalIconDirective} from '@ecodev/natural';
import {Component, Input, OnInit} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatHint, MatLabel, MatPrefix} from '@angular/material/form-field';

function samePasswordsValidator(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
        return null;
    }

    const password = formGroup.controls.password.value;
    const confirmPassword = formGroup.controls.confirmPassword.value;

    return password === confirmPassword ? null : {notSame: true};
}

class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: FormControl | null): boolean {
        if (control?.parent && control.parent instanceof FormGroup) {
            return !!samePasswordsValidator(control.parent) && control.dirty;
        }

        return false;
    }
}

@Component({
    selector: 'app-password',
    imports: [
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatHint,
        MatPrefix,
        FormsModule,
        ReactiveFormsModule,
        MatInput,
        MatIcon,
        NaturalIconDirective,
    ],
    templateUrl: './password.component.html',
    styleUrl: './password.component.scss',
})
export class PasswordComponent implements OnInit {
    @Input({required: true}) public form!: FormGroup;
    protected confirmPasswordStateMatcher = new ConfirmPasswordStateMatcher();

    public ngOnInit(): void {
        this.form.setControl('password', new FormControl('', [Validators.required, Validators.minLength(12)]));
        this.form.setControl('confirmPassword', new FormControl(''));
        this.form.setValidators(samePasswordsValidator);
    }
}
