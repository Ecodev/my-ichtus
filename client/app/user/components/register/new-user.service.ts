import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { FormAsyncValidators, FormValidators, Literal, unique } from '@ecodev/natural';
import { PricedBookingService } from '../../../admin/bookings/services/PricedBooking.service';
import { AnonymousUserService } from './anonymous-user.service';
import { loginValidator } from '../../../admin/users/services/user.service';
import { User_user } from '../../../shared/generated-types';

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
            login: [Validators.required, loginValidator],
            firstName: [Validators.required, Validators.maxLength(100)],
            lastName: [Validators.required, Validators.maxLength(100)],
            email: [Validators.required, Validators.email],
            familyRelationship: [Validators.required],
            birthday: [Validators.required],
            mobilePhone: [Validators.required, Validators.maxLength(25)],
            locality: [Validators.required],
            street: [Validators.required],
            postcode: [Validators.required],
            country: [Validators.required],
        };
    }

    public getFormAsyncValidators(model: User_user): FormAsyncValidators {
        return {
            login: [unique('login', model.id, this)],
        };
    }
}
