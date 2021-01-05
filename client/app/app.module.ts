import {Apollo} from 'apollo-angular';
import {HttpBatchLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {DateAdapter, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material/core';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatIconRegistry} from '@angular/material/icon';
import {NetworkActivityService} from './shared/services/network-activity.service';
import {
    Literal,
    NaturalAlertService,
    NaturalSeoService,
    NaturalSwissParsingDateAdapter,
    NATURAL_SEO_CONFIG,
    NaturalSeoConfig,
} from '@ecodev/natural';
import {NgProgressModule} from 'ngx-progressbar';
import {apolloDefaultOptions, createApolloLink} from './shared/config/apolloDefaultOptions';
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

registerLocaleData(localeFRCH);
registerLocaleData(localeDECH);

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
        BrowserModule,
        BrowserAnimationsModule,
        NgProgressModule,
        AppRoutingModule,
        MaterialModule,
        IchtusModule,
        HttpClientModule,
        TimeagoModule.forRoot({
            intl: {provide: TimeagoIntl, useClass: TimeagoIntl},
            formatter: {provide: TimeagoFormatter, useClass: TimeagoCustomFormatter},
        }),
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
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
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
            } as NaturalSeoConfig,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(
        apollo: Apollo,
        networkActivityService: NetworkActivityService,
        alertService: NaturalAlertService,
        httpBatchLink: HttpBatchLink,
        dateAdapter: DateAdapter<Date>,
        intl: TimeagoIntl,
        naturalSeoService: NaturalSeoService, // injection required, but works as stand alone
    ) {
        dateAdapter.setLocale('fr-ch');

        intl.strings = frenchStrings;
        intl.changes.next();

        const link = createApolloLink(networkActivityService, alertService, httpBatchLink);

        apollo.create({
            link: link,
            cache: new InMemoryCache(),
            defaultOptions: apolloDefaultOptions,
        });
    }
}
