import {APP_INITIALIZER, enableProdMode, importProvidersFrom, inject, LOCALE_ID} from '@angular/core';
import {environment} from './environments/environment';
import {AppComponent} from './app/app.component';
import {TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule} from 'ngx-timeago';
import {routes} from './app/app-routing.module';
import {provideAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {Apollo} from 'apollo-angular';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {apolloOptionsProvider} from './app/shared/config/apollo-options.provider';
import {LocalizedPaginatorIntlService} from './app/shared/services/localized-paginator-intl.service';
import {activityInterceptor} from './app/shared/services/activity-interceptor';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorDefaultOptions, MatPaginatorIntl} from '@angular/material/paginator';
import {
    DateAdapter,
    ErrorStateMatcher,
    provideNativeDateAdapter,
    ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import {LoggerExtraService} from './app/shared/services/logger-extra.service';
import {localConfig} from './app/shared/generated-config';
import {
    graphqlQuerySigner,
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
import {MAT_TABS_CONFIG, MatTabsConfig} from '@angular/material/tabs';

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

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            TimeagoModule.forRoot({
                intl: {provide: TimeagoIntl, useClass: TimeagoIntl},
                formatter: {provide: TimeagoFormatter, useClass: TimeagoCustomFormatter},
            }),
        ),
        Apollo,
        provideNativeDateAdapter(),
        provideAnimations(),
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
            } satisfies MatPaginatorDefaultOptions,
        },
        {
            provide: MAT_TABS_CONFIG,
            useValue: {
                stretchTabs: false,
            } satisfies MatTabsConfig,
        },
        {provide: LOCALE_ID, useValue: 'fr-CH'},
        {
            provide: MatPaginatorIntl,
            useClass: LocalizedPaginatorIntlService,
        },
        apolloOptionsProvider,
        {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: matTooltipCustomConfig},
        provideHttpClient(
            withInterceptors([activityInterceptor, graphqlQuerySigner(localConfig.signedQueries.keys.app)]),
        ),
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
