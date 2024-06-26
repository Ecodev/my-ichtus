import {Routes} from '@angular/router';
import {ScanComponent} from './components/scan/scan.component';
import {BookableComponent} from './bookable/bookable.component';
import {resolveBookableByCode} from './bookable/bookable-by-code.resolver';
import {CodeInputComponent} from './components/code-input/code-input.component';
import {SelfApprovedBookingComponent} from './components/self-approved-booking/self-approved-booking.component';
import {NaturalSeo} from '@ecodev/natural';
import {resolveOptionalBookableByParam} from './bookable/optional-bookable-by-param.resolver';

export const routes: Routes = [
    {
        path: 'by-scan',
        component: ScanComponent,
        data: {
            seo: {
                title: 'Scan',
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'by-code',
        component: CodeInputComponent,
        data: {
            seo: {
                title: 'Code du matériel',
            } satisfies NaturalSeo,
        },
    },
    {
        path: 'new',
        component: SelfApprovedBookingComponent,
        resolve: {
            bookable: resolveOptionalBookableByParam,
        },
        data: {
            seo: {
                title: 'Nouvelle sortie',
            } satisfies NaturalSeo,
        },
    },
    {
        path: ':bookableCode',
        component: BookableComponent,
        resolve: {
            model: resolveBookableByCode,
        },
        data: {
            seo: {resolve: true} satisfies NaturalSeo,
        },
    },
];
