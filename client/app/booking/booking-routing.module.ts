import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScanComponent} from './components/scan/scan.component';
import {BookableComponent} from './bookable/bookable.component';
import {BookableByCodeResolver} from './bookable/bookable-by-code.resolver';
import {CodeInputComponent} from './components/code-input/code-input.component';
import {SelfApprovedBookingComponent} from './components/self-approved-booking/self-approved-booking.component';
import {NaturalSeo} from '@ecodev/natural';

const routes: Routes = [
    {
        path: 'by-scan',
        component: ScanComponent,
        data: {
            seo: {
                title: 'Scan',
            } as NaturalSeo,
        },
    },
    {
        path: 'by-code',
        component: CodeInputComponent,
        data: {
            seo: {
                title: 'Code du matériel',
            } as NaturalSeo,
        },
    },
    {
        path: 'new',
        component: SelfApprovedBookingComponent,
        data: {
            seo: {
                title: 'Nouvelle sortie',
            } as NaturalSeo,
        },
    },
    {
        path: ':bookableCode',
        component: BookableComponent,
        resolve: {
            bookable: BookableByCodeResolver,
        },
        data: {
            seo: {resolveKey: 'bookable'} as NaturalSeo,
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BookingRoutingModule {}
