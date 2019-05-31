import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { FormValidators, FormAsyncValidators, NaturalValidators } from '@ecodev/natural';
import { PricedBookingService } from '../../../admin/bookings/services/PricedBooking.service';
import { Literal } from '@ecodev/natural';
import { AnonymousUserService } from './anonymous-user.service';
import { LoginValidatorFn } from '../../../admin/users/services/user.service';

@Injectable({
    providedIn: 'root',
})
export class NewUserService extends AnonymousUserService {

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
            password: '',
        };
    }

    public getFormValidators(): FormValidators {
        return {
            login: [Validators.required, LoginValidatorFn],
            firstName: [Validators.required, Validators.maxLength(100)],
            lastName: [Validators.required, Validators.maxLength(100)],
            email: [Validators.required, Validators.email],
            familyRelationship: [Validators.required],
            birthday: [Validators.required],
            locality: [Validators.required],
            street: [Validators.required],
            postcode: [Validators.required],
            country: [Validators.required],
        };
    }

    public getFormAsyncValidators(): FormAsyncValidators {
        return {
            login: [NaturalValidators.unique('login', this)],
        };
    }
}
