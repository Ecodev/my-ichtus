import { Injectable } from '@angular/core';
import { UserService } from '../../../admin/users/services/user.service';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { Validators } from '@angular/forms';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { FormValidators, Literal } from '@ecodev/natural';
import { PricedBookingService } from '../../../admin/bookings/services/PricedBooking.service';

@Injectable({
    providedIn: 'root',
})
export class AnonymousUserService extends UserService {

    constructor(apollo: Apollo,
                router: Router,
                bookingService: BookingService,
                permissionsService: PermissionsService,
                pricedBookingService: PricedBookingService,
    ) {
        super(apollo, router, bookingService, permissionsService, pricedBookingService);
    }

    protected getDefaultForClient(): Literal {
        return {
            country: {id: 1, name: 'Suisse'},
            hasInsurance: false,
            termsAgreement: false,
        } ;
    }

    public getFormValidators(): FormValidators {
        return {
            email: [Validators.required, Validators.email],
            hasInsurance: [],
            termsAgreement: [],
        };
    }
}
