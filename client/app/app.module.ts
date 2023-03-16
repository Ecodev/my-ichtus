import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {ApolloModule} from 'apollo-angular';
import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorIntl} from '@angular/material/paginator';
import {DateAdapter, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MatIconRegistry} from '@angular/material/icon';
import {
    NATURAL_SEO_CONFIG,
    NaturalErrorModule,
    NaturalSeoConfig,
    NaturalSeoService,
    NaturalSwissParsingDateAdapter,
} from '@ecodev/natural';
import {NgProgressModule} from 'ngx-progressbar';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {DoorComponent} from './door/door.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {BootLoaderComponent} from './shared/components/boot-loader/boot-loader.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ErrorComponent} from './shared/components/error/error.component';
import {MaterialModule} from './shared/modules/material.module';
import {IchtusModule} from './shared/modules/ichtus.module';
import {LocalizedPaginatorIntlService} from './shared/services/localized-paginator-intl.service';
import {NetworkInterceptorService} from './shared/services/network-interceptor.service';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeDECH from '@angular/common/locales/de-CH';
import {registerLocaleData} from '@angular/common';
import {SafetyComponent} from './safety/safety.component';
import {TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule} from 'ngx-timeago';
import {strings as frenchStrings} from 'ngx-timeago/language-strings/fr-short';
import {LoggerExtraService} from './shared/services/logger-extra.service';
import {localConfig} from './shared/generated-config';
import {apolloOptionsProvider} from './shared/config/apolloDefaultOptions';

registerLocaleData(localeFRCH);
registerLocaleData(localeDECH);

export const matTooltipCustomConfig: MatTooltipDefaultOptions = {
    showDelay: 5,
    hideDelay: 5,
    touchendHideDelay: 5,
    touchGestures: 'off',
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        DoorComponent,
        DashboardComponent,
        BootLoaderComponent,
        ErrorComponent,
        SafetyComponent,
    ],
    imports: [
        ApolloModule,
        BrowserModule,
        BrowserAnimationsModule.withConfig({
            // Disable animations if not supported (on iPhone 6 / Safari 13)
            disableAnimations:
                !('animate' in document.documentElement) ||
                (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent)),
        }),
        NgProgressModule,
        AppRoutingModule,
        MaterialModule,
        IchtusModule,
        HttpClientModule,
        TimeagoModule.forRoot({
            intl: {provide: TimeagoIntl, useClass: TimeagoIntl},
            formatter: {provide: TimeagoFormatter, useClass: TimeagoCustomFormatter},
        }),
        NaturalErrorModule.forRoot(localConfig.log.url, LoggerExtraService),
    ],
    providers: [
        MatIconRegistry,
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
        {
            provide: NATURAL_SEO_CONFIG,
            useValue: {
                applicationName: 'MyIchtus',
            } satisfies NaturalSeoConfig,
        },
        apolloOptionsProvider,
        {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: matTooltipCustomConfig},
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    public constructor(
        dateAdapter: DateAdapter<Date>,
        intl: TimeagoIntl,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        naturalSeoService: NaturalSeoService, // injection required, but works as stand alone
    ) {
        dateAdapter.setLocale('fr-ch');

        intl.strings = frenchStrings;
        intl.changes.next();
    }
}
