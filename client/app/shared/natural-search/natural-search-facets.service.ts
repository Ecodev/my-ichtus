import { Injectable } from '@angular/core';
import {
    DropdownFacet,
    FlagFacet,
    NaturalEnumService,
    NaturalSearchFacets,
    TypeNaturalSelectComponent,
    TypeSelectNaturalConfiguration,
    TypeNumberComponent,
    TypeNumberConfiguration,
    TypeHierarchicSelectorComponent,
    TypeHierarchicSelectorConfiguration,
    TypeDateComponent,
    TypeDateConfiguration,
    TypeTextComponent,
    TypeSelectComponent,
    TypeSelectConfiguration,
    wrapLike, replaceOperatorByName,
} from '@ecodev/natural';
import { UserTagService } from '../../admin/userTags/services/userTag.service';
import { BookableService } from '../../admin/bookables/services/bookable.service';
import { UserService } from '../../admin/users/services/user.service';
import { LicenseService } from '../../admin/licenses/services/license.service';
import { TransactionService } from '../../admin/transactions/services/transaction.service';
import { UserFilterGroupCondition } from '../generated-types';
import { AccountService } from '../../admin/accounts/services/account.service';
import { AccountHierarchicConfiguration } from '../hierarchic-selector/AccountHierarchicConfiguration';
import { BookableTagService } from '../../admin/bookableTags/services/bookableTag.service';

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

    private readonly licenses: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Certifications',
        field: 'licenses',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.licenceService,
            placeholder: 'Certifications'
        },
    };

    private readonly  bookableTags: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Tags',
        field: 'bookableTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.bookableTagService,
            placeholder: 'Tags',
        },
    };

    private readonly owner: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Utilisateur',
        field: 'owner',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.userService,
            placeholder: 'Utilisateur',
        },
    };

    private readonly userWelcomeSession: FlagFacet = {
        display: 'N\'a pas été accueilli',
        field: 'welcomeSessionDate',
        condition: {null: {}} as UserFilterGroupCondition,
    };

    private readonly receivesNewsletter: FlagFacet = {
        display: 'Abonné newsletter',
        field: 'receivesNewsletter',
        condition: {equal: {value: true}} as UserFilterGroupCondition,
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

    private readonly bookable: DropdownFacet<TypeSelectNaturalConfiguration> = {
        display: 'Réservable',
        field: 'bookable',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.bookableService,
            placeholder: 'Réservable',
        },
    };

    private readonly code: DropdownFacet<never> = {
        display: 'Code',
        field: 'code',
        component: TypeTextComponent,
        transform: wrapLike,
    };

    private readonly name: DropdownFacet<never> = {
        display: 'Nom',
        field: 'name',
        component: TypeTextComponent,
        transform: wrapLike,
    };

    private readonly creationDate: DropdownFacet<TypeDateConfiguration> = {
        display: 'Date de création',
        field: 'creationDate',
        component: TypeDateComponent,
    };

    private readonly updateDate: DropdownFacet<TypeDateConfiguration> = {
        display: 'Date de modification',
        field: 'updateDate',
        component: TypeDateComponent,
    };

    private readonly allFacets: { [key: string]: NaturalSearchFacets } = {
        users: [
            this.userTags,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('UserStatus'),
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Rôle',
                field: 'role',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('UserRole'),
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Mode de paiement',
                field: 'billingType',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('BillingType'),
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Login',
                field: 'login',
                component: TypeTextComponent,
                transform: wrapLike,
            } as DropdownFacet<never>,
            {
                display: 'Date de naissance',
                field: 'birthday',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Date de démission',
                field: 'resignDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Date d\'accueil',
                field: 'welcomeSessionDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            this.userWelcomeSession,
            this.licenses,
            this.receivesNewsletter,
            this.creationDate,
            this.updateDate,
        ],
        transactionLines: [
            this.transaction,
            {
                display: 'Montant',
                field: 'balance',
                component: TypeNumberComponent,
                configuration: {
                    step: 0.01,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Compte au débit',
                field: 'debit',
                component: TypeHierarchicSelectorComponent,
                configuration: {
                    key: 'account',
                    service: this.accountService,
                    config: AccountHierarchicConfiguration,
                },
            } as DropdownFacet<TypeHierarchicSelectorConfiguration>,
            {
                display: 'Compte au crédit',
                field: 'credit',
                component: TypeHierarchicSelectorComponent,
                configuration: {
                    key: 'account',
                    service: this.accountService,
                    config: AccountHierarchicConfiguration,
                },
            } as DropdownFacet<TypeHierarchicSelectorConfiguration>,
            {
                display: 'Date de transaction',
                field: 'transactionDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            this.bookable,
            this.owner,
            this.creationDate,
            this.updateDate,
        ],
        storage: [
            this.name,
            this.code,
            {
                display: 'Réservations simultanées',
                field: 'simultaneousBookingMaximum',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Utilisateur',
                field: 'custom',
                name: 'bookableUsage',
                transform: replaceOperatorByName,
                component: TypeNaturalSelectComponent,
                configuration: <TypeSelectNaturalConfiguration> {
                    service: this.userService,
                    placeholder: 'Utilisateur',
                },
            } as DropdownFacet<TypeSelectNaturalConfiguration>,
            this.creationDate,
            this.updateDate,
        ],
        bookables: [
            this.name,
            this.code,
            this.bookableTags,
            {
                display: 'Type de réservation',
                field: 'bookingType',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('BookingType'),
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Prix initial',
                field: 'initialPrice',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Prix périodique',
                field: 'periodicPrice',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Prix d\'achat',
                field: 'purchasePrice',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Réservations simultanées',
                field: 'simultaneousBookingMaximum',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            this.creationDate,
            this.updateDate,
        ],
        bookings: [
            this.owner,
            this.bookable,
            {
                display: 'Date de début',
                field: 'startDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Date de fin',
                field: 'endDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Destination',
                field: 'destination',
                component: TypeTextComponent,
                transform: wrapLike,
            } as DropdownFacet<never>,
            {
                display: 'Nb de participants',
                field: 'participantCount',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            this.creationDate,
            this.updateDate,
        ],
        accounts: [
            this.name,
            this.code,
            {
                display: 'Type',
                field: 'type',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('AccountType'),
                }
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Solde',
                field: 'balance',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            this.creationDate,
            this.updateDate,
        ],
        expenseClaims: [
            this.name,
            {
                display: 'Type',
                field: 'type',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('ExpenseClaimType'),
                }
            } as DropdownFacet<TypeSelectConfiguration>,
            this.owner,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('ExpenseClaimStatus'),
                }
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Montant',
                field: 'amount',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            this.creationDate,
            this.updateDate,
        ],
    };

    constructor(
        private readonly enumService: NaturalEnumService<any>,
        private readonly userTagService: UserTagService,
        private readonly transactionService: TransactionService,
        private readonly bookableService: BookableService,
        private readonly bookableTagService: BookableTagService,
        private readonly accountService: AccountService,
        private readonly userService: UserService,
        private readonly licenceService: LicenseService,
    ) {
    }

    /**
     * Returns the natural search configuration for given, or null if non-existent
     */
    public get(key: string): NaturalSearchFacets | null {
        return this.allFacets[key];
    }

}
