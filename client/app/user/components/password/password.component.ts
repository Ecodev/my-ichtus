import {Component, Input, OnInit} from '@angular/core';
import {
    AbstractControl,
    UntypedFormControl,
    UntypedFormGroup,
    ValidationErrors,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {NaturalIconDirective} from '@ecodev/natural';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

function samePasswordsValidator(formGroup: AbstractControl): ValidationErrors | null {
    if (!formGroup || !(formGroup instanceof UntypedFormGroup)) {
        return null;
    }

    const password = formGroup.controls.password.value;
    const confirmPassword = formGroup.controls.confirmPassword.value;

    return password === confirmPassword ? null : {notSame: true};
}

class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: UntypedFormControl | null): boolean {
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
    standalone: true,
    imports: [
        FlexModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        CommonModule,
    ],
})
export class PasswordComponent implements OnInit {
    @Input({required: true}) public form!: UntypedFormGroup;
    public confirmPasswordStateMatcher = new ConfirmPasswordStateMatcher();

    public ngOnInit(): void {
        this.form.removeControl('password');
        this.form.addControl('password', new UntypedFormControl('', [Validators.required, Validators.minLength(12)]));
        this.form.addControl('confirmPassword', new UntypedFormControl(''));
        this.form.setValidators(samePasswordsValidator);
    }
}
