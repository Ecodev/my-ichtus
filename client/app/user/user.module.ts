import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RequestPasswordResetComponent} from './components/request-password-reset/request-password-reset.component';
import {ChangePasswordComponent} from './components/change-password/change-password.component';
import {UserRoutingModule} from './user-routing.module';
import {RegisterComponent} from './components/register/register.component';
import {RegisterConfirmComponent} from './components/register/register-confirm.component';
import {MaterialModule} from '../shared/modules/material.module';
import {IchtusModule} from '../shared/modules/ichtus.module';
import {PasswordComponent} from './components/password/password.component';

@NgModule({
    declarations: [
        RegisterComponent,
        RegisterConfirmComponent,
        RequestPasswordResetComponent,
        ChangePasswordComponent,
        PasswordComponent,
    ],
    imports: [CommonModule, UserRoutingModule, MaterialModule, IchtusModule],
})
export class UserModule {}
