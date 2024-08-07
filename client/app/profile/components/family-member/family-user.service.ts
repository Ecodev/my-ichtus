import {Inject, Injectable} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {Router} from '@angular/router';
import {BookingService} from '../../../admin/bookings/services/booking.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {Relationship, UserInput, UserRole} from '../../../shared/generated-types';
import {FormValidators, LOCAL_STORAGE, NaturalStorage} from '@ecodev/natural';
import {PricedBookingService} from '../../../admin/bookings/services/PricedBooking.service';

@Injectable({
    providedIn: 'root',
})
export class FamilyUserService extends UserService {
    public constructor(
        router: Router,
        bookingService: BookingService,
        permissionsService: PermissionsService,
        pricedBookingService: PricedBookingService,
        @Inject(LOCAL_STORAGE) storage: NaturalStorage,
    ) {
        super(router, bookingService, permissionsService, pricedBookingService, storage);
    }

    public override getDefaultForServer(): UserInput {
        return {
            ...super.getDefaultForServer(),
            termsAgreement: false,
            familyRelationship: Relationship.Partner,
            role: UserRole.individual,
            door1: true,
            door2: true,
            door3: true,
        };
    }

    public override getFormValidators(): FormValidators {
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
