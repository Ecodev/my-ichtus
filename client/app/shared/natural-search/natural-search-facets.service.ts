import { Injectable } from '@angular/core';
import {
    DropdownFacet,
    FlagFacet,
    NaturalSearchFacets,
    TypeNaturalSelectComponent,
    TypeSelectNaturalConfiguration,
} from '@ecodev/natural';
import { UserTagService } from '../../admin/userTags/services/userTag.service';
import { TransactionService } from '../../admin/transactions/services/transaction.service';
import { UserFilterGroupCondition } from '../generated-types';

/**
 * Collection of facets for natural-search accessible by the object name
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalSearchFacetsService {

    private readonly userTags: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Tags',
        field: 'userTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.userTagService,
            placeholder: 'Tags',
        },
    };

    private readonly userWelcomeSession: FlagFacet = {
        display: 'N\'a pas été accueilli',
        field: 'welcomeSessionDate',
        condition: {null: {}} as UserFilterGroupCondition,
    };

    private readonly transaction: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Transaction',
        field: 'transaction',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.transactionService,
            placeholder: 'Transaction',
        },
    };

    private readonly allFacets: { [key: string]: NaturalSearchFacets } = {
        users: [
            this.userTags,
            this.userWelcomeSession,
        ],
        transactionLines: [
            this.transaction,
        ],
    };

    constructor(
        public userTagService: UserTagService,
        private readonly transactionService: TransactionService,
    ) {
    }

    /**
     * Returns the natural search configuration for given, or null if non-existent
     */
    public get(key: string): NaturalSearchFacets | null {
        return this.allFacets[key];
    }

}
