import {Apollo} from 'apollo-angular';
import {Inject, Injectable} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {Router} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {Relationship, UserRole, UserStatus} from '../../../shared/generated-types';
import {FormValidators, Literal, LOCAL_STORAGE, NaturalStorage} from '@ecodev/natural';
import {PricedBookingService} from '../../../admin/bookings/services/PricedBooking.service';

@Injectable({
    providedIn: 'root',
})
export class FamilyUserService extends UserService {
    constructor(
        apollo: Apollo,
        router: Router,
        bookingService: BookingService,
        permissionsService: PermissionsService,
        pricedBookingService: PricedBookingService,
        @Inject(LOCAL_STORAGE) storage: NaturalStorage,
    ) {
        super(apollo, router, bookingService, permissionsService, pricedBookingService, storage);
    }

    protected getDefaultForClient(): Literal {
        return {
            country: {id: 1, name: 'Suisse'},
            hasInsurance: false,
            termsAgreement: false,
            familyRelationship: Relationship.partner,
            role: UserRole.individual,
            door1: true,
            door2: true,
            door3: true,
        };
    }

    public getFormValidators(): FormValidators {
        const validators = {
            hasInsurance: [],
            termsAgreement: [],
            locality: [],
            street: [],
            postcode: [],
            country: [],
        };

        return Object.assign(super.getFormValidators(), validators);
    }
}
