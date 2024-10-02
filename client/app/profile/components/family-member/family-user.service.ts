import {Injectable} from '@angular/core';
import {UserService} from '../../../admin/users/services/user.service';
import {Relationship, UserInput, UserRole} from '../../../shared/generated-types';
import {FormValidators} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class FamilyUserService extends UserService {
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
