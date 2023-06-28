import {APP_INITIALIZER, enableProdMode, importProvidersFrom, inject, LOCALE_ID} from '@angular/core';
import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';
import {TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule} from 'ngx-timeago';
import {routes} from './app/app-routing.module';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {Apollo} from 'apollo-angular';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {apolloOptionsProvider} from './app/shared/config/apolloDefaultOptions';
import {LocalizedPaginatorIntlService} from './app/shared/services/localized-paginator-intl.service';
import {NetworkInterceptorService} from './app/shared/services/network-interceptor.service';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorIntl} from '@angular/material/paginator';
import {
    DateAdapter,
    ErrorStateMatcher,
    MatNativeDateModule,
    ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import {LoggerExtraService} from './app/shared/services/logger-extra.service';
import {localConfig} from './app/shared/generated-config';
import {
    NaturalIconsConfig,
    naturalProviders,
    NaturalSwissParsingDateAdapter,
    provideErrorHandler,
    provideIcons,
    provideSeo,
} from '@ecodev/natural';
import {strings as frenchStrings} from 'ngx-timeago/language-strings/fr-short';
import {registerLocaleData} from '@angular/common';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeDECH from '@angular/common/locales/de-CH';
import {provideRouter, withRouterConfig} from '@angular/router';

if (environment.production) {
    enableProdMode();
}

registerLocaleData(localeFRCH);
registerLocaleData(localeDECH);

const matTooltipCustomConfig: MatTooltipDefaultOptions = {
    showDelay: 5,
    hideDelay: 5,
    touchendHideDelay: 5,
    touchGestures: 'off',
};

const iconsConfig: NaturalIconsConfig = {
    qr: {
        svg: 'assets/icons/qr.svg',
    },
    own_bookable: {
        svg: 'assets/icons/swimsuit.svg',
    },
    code: {
        svg: 'assets/icons/input.svg',
    },
    doors: {
        svg: 'assets/icons/key.svg',
    },
    family: {
        svg: 'assets/icons/family.svg',
    },
    lake: {
        svg: 'assets/icons/lake.svg',
    },
    transactionHistory: {
        svg: 'assets/icons/history.svg',
    },
    claims: {
        svg: 'assets/icons/claims.svg',
    },
    administrator: {
        svg: 'assets/icons/boss.svg',
    },
    exit: {
        svg: 'assets/icons/exit.svg',
    },
    ichtus: {
        svg: 'assets/ichtus.svg',
    },
    support: {
        svg: 'assets/icons/signpost.svg',
    },
    announcement: {
        svg: 'assets/icons/megaphone.svg',
    },
};

// Disable animations if not supported (on iPhone 6 / Safari 13, or SSR)
const disableAnimations =
    // eslint-disable-next-line no-restricted-globals
    typeof document === 'undefined' ||
    // eslint-disable-next-line no-restricted-globals
    !('animate' in document.documentElement) ||
    // eslint-disable-next-line no-restricted-globals
    (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            MatNativeDateModule,
            TimeagoModule.forRoot({
                intl: {provide: TimeagoIntl, useClass: TimeagoIntl},
                formatter: {provide: TimeagoFormatter, useClass: TimeagoCustomFormatter},
            }),
        ),
        Apollo,
        disableAnimations ? provideNoopAnimations() : provideAnimations(),
        naturalProviders,
        provideErrorHandler(localConfig.log.url, LoggerExtraService),
        provideSeo({
            applicationName: 'MyIchtus',
        }),
        provideIcons(iconsConfig),
        {
            provide: DateAdapter,
            useClass: NaturalSwissParsingDateAdapter,
        },
        {
            // Use OnDirty instead of default OnTouched, that allows to validate while editing. Touched is updated after blur.
            provide: ErrorStateMatcher,
            useClass: ShowOnDirtyErrorStateMatcher,
        },
        {
            // See https://github.com/angular/components/issues/26580
            provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
            useValue: {
                formFieldAppearance: 'fill',
            },
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NetworkInterceptorService,
            multi: true,
        },
        {provide: LOCALE_ID, useValue: 'fr-CH'},
        {
            provide: MatPaginatorIntl,
            useClass: LocalizedPaginatorIntlService,
        },
        apolloOptionsProvider,
        {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: matTooltipCustomConfig},
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(
            routes,
            withRouterConfig({
                paramsInheritanceStrategy: 'always',
            }),
        ),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: (): (() => void) => {
                const dateAdapter = inject(DateAdapter);
                const intl = inject(TimeagoIntl);

                return () => {
                    dateAdapter.setLocale('fr-ch');

                    intl.strings = frenchStrings;
                    intl.changes.next();
                };
            },
        },
    ],
}).catch(err => console.error(err));
