import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScanComponent} from './components/scan/scan.component';
import {BookingRoutingModule} from './booking-routing.module';
import {IchtusModule} from '../shared/modules/ichtus.module';
import {MaterialModule} from '../shared/modules/material.module';
import {BookableComponent} from './bookable/bookable.component';
import {CodeInputComponent} from './components/code-input/code-input.component';
import {SelfApprovedBookingComponent} from './components/self-approved-booking/self-approved-booking.component';

@NgModule({
    declarations: [ScanComponent, BookableComponent, CodeInputComponent, SelfApprovedBookingComponent],
    imports: [CommonModule, BookingRoutingModule, IchtusModule, MaterialModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookingModule {}
