import { Injectable } from '@angular/core';
import { UserService } from '../../../admin/users/services/user.service';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Literal } from '../../../shared/types';
import { FormValidators } from '../../../shared/services/abstract-model.service';
import { BookingService } from '../../../admin/bookings/services/booking.service';
import { Validators } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class AnonymousUserService extends UserService {

    constructor(apollo: Apollo, router: Router, bookingService: BookingService) {
        super(apollo, router, bookingService);
    }

    public getDefaultValues(): Literal {
        const values = {
            hasInsurance: false,
            termsAgreement: false,
        };

        return Object.assign(super.getDefaultValues(), values);
    }

    public getFormValidators(): FormValidators {
        return {
            email: [Validators.required],
            hasInsurance: [],
            termsAgreement: [],
        };
    }
}