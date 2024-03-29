import {Routes} from '@angular/router';
import {RegisterComponent} from './components/register/register.component';
import {RegisterConfirmComponent} from './components/register/register-confirm.component';
import {resolveUserByToken} from '../admin/users/services/userByToken.resolver';
import {RequestPasswordResetComponent} from './components/request-password-reset/request-password-reset.component';
import {ChangePasswordComponent} from './components/change-password/change-password.component';
import {NaturalSeo} from '@ecodev/natural';

export const routes: Routes = [
    {
        path: 'new',
        component: RegisterComponent,
        data: {
            seo: {
                title: `Adhésion`,
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'confirm/:token',
        component: RegisterConfirmComponent,
        resolve: {
            user: resolveUserByToken,
        },
        data: {
            seo: {
                title: `Confirmation d'adhésion`,
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'request-password-reset',
        component: RequestPasswordResetComponent,
        data: {
            seo: {
                title: `Demande de changement de mot de passe`,
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'change-password/:token',
        component: ChangePasswordComponent,
        resolve: {
            user: resolveUserByToken,
        },
        data: {
            seo: {
                title: `Changement de mot de passe`,
            } satisfies NaturalSeo,
        },
    },
];
