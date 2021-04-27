import {Injectable} from '@angular/core';
import {
    DropdownFacet,
    FlagFacet,
    NaturalEnumService,
    NaturalSearchFacets,
    NaturalSearchSelection,
    replaceOperatorByName,
    TypeDateComponent,
    TypeDateConfiguration,
    TypeHierarchicSelectorComponent,
    TypeHierarchicSelectorConfiguration,
    TypeNaturalSelectComponent,
    TypeNumberComponent,
    TypeNumberConfiguration,
    TypeSelectComponent,
    TypeSelectConfiguration,
    TypeSelectNaturalConfiguration,
    TypeTextComponent,
    upperCaseFirstLetter,
    wrapLike,
} from '@ecodev/natural';
import {UserTagService} from '../../admin/userTags/services/userTag.service';
import {BookableService} from '../../admin/bookables/services/bookable.service';
import {UserService} from '../../admin/users/services/user.service';
import {LicenseService} from '../../admin/licenses/services/license.service';
import {TransactionService} from '../../admin/transactions/services/transaction.service';
import {TransactionTagService} from '../../admin/transactionTags/services/transactionTag.service';
import {BookableFilter, BookingType, UserFilterGroupCondition} from '../generated-types';
import {AccountService} from '../../admin/accounts/services/account.service';
import {accountHierarchicConfiguration} from '../hierarchic-selector/AccountHierarchicConfiguration';
import {BookableTagService} from '../../admin/bookableTags/services/bookableTag.service';

/**
 * Prepend the field name to the operator.
 *
 * So:
 *
 *     {field: 'myFieldName', condition: {equal: {value: 123}}}
 *
 * will become
 *
 *     {field: 'myFieldName', condition: {myFieldNameEqual: {value: 123}}}
 */
function prefixOperatorWithField(selection: NaturalSearchSelection): NaturalSearchSelection {
    const field = selection.field;
    for (const oldOperator of Object.keys(selection.condition)) {
        const newOperator = field + upperCaseFirstLetter(oldOperator);
        selection.condition[newOperator] = selection.condition[oldOperator];

        delete selection.condition[oldOperator];
    }

    return selection;
}

/**
 * Collection of facets for natural-search accessible by the object name
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalSearchFacetsService {
    private readonly userTags: DropdownFacet<TypeSelectNaturalConfiguration<UserTagService>> = {
        display: 'Tags',
        field: 'userTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.userTagService,
            placeholder: 'Tags',
        },
    };

    private readonly transactionTags: DropdownFacet<TypeSelectNaturalConfiguration<TransactionTagService>> = {
        display: 'Tags',
        field: 'transactionTag',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.transactionTagService,
            placeholder: 'Tags',
        },
    };

    private readonly licenses: DropdownFacet<TypeSelectNaturalConfiguration<LicenseService>> = {
        display: 'Certifications',
        field: 'licenses',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.licenceService,
            placeholder: 'Certifications',
        },
    };

    private readonly bookableTags: DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>> = {
        display: 'Tags',
        field: 'bookableTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.bookableTagService,
            placeholder: 'Tags',
        },
    };

    private readonly owner: DropdownFacet<TypeSelectNaturalConfiguration<UserService>> = {
        display: 'Utilisateur',
        field: 'owner',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.userService,
            placeholder: 'Utilisateur',
        },
    };

    private readonly userWelcomeSession: FlagFacet = {
        display: "N'a pas été accueilli",
        field: 'welcomeSessionDate',
        condition: {null: {}} as UserFilterGroupCondition,
    };

    private readonly receivesNewsletter: FlagFacet = {
        display: 'Abonné newsletter',
        field: 'receivesNewsletter',
        condition: {equal: {value: true}} as UserFilterGroupCondition,
    };

    private readonly transaction: DropdownFacet<TypeSelectNaturalConfiguration<TransactionService>> = {
        display: 'Transaction',
        field: 'transaction',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.transactionService,
            placeholder: 'Transaction',
        },
    };

    private readonly bookable: DropdownFacet<TypeSelectNaturalConfiguration<BookableService>> = {
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

    private readonly creator: DropdownFacet<TypeSelectNaturalConfiguration<UserService>> = {
        display: 'Utilisateur',
        field: 'creator',
        component: TypeNaturalSelectComponent,
        configuration: {
            placeholder: 'Utilisateur',
            service: this.userService,
        },
    };

    private readonly message: DropdownFacet<never> = {
        display: 'Message',
        field: 'message',
        component: TypeTextComponent,
        transform: wrapLike,
    };

    private readonly isActive: DropdownFacet<TypeSelectConfiguration> = {
        display: 'Actif',
        field: 'isActive',
        component: TypeSelectComponent,
        name: 'isActive',
        configuration: {
            items: [
                {value: true, name: 'Oui'},
                {value: false, name: 'Non'},
            ],
        },
    };

    private readonly bookingType: DropdownFacet<TypeSelectConfiguration> = {
        display: 'Type de réservation',
        field: 'bookingType',
        component: TypeSelectComponent,
        configuration: {
            items: this.enumService.get('BookingType'),
        },
    };

    private readonly initialPrice: DropdownFacet<TypeNumberConfiguration> = {
        display: 'Prix initial',
        field: 'initialPrice',
        component: TypeNumberComponent,
        configuration: {
            step: 1,
        },
    };

    private readonly periodicPrice: DropdownFacet<TypeNumberConfiguration> = {
        display: 'Prix périodique',
        field: 'periodicPrice',
        component: TypeNumberComponent,
        configuration: {
            step: 1,
        },
    };

    private readonly purchasePrice: DropdownFacet<TypeNumberConfiguration> = {
        display: "Prix d'achat",
        field: 'purchasePrice',
        component: TypeNumberComponent,
        configuration: {
            step: 1,
        },
    };

    private readonly simultaneousBookingMaximum: DropdownFacet<TypeNumberConfiguration> = {
        display: 'Réservations simultanées',
        field: 'simultaneousBookingMaximum',
        component: TypeNumberComponent,
        configuration: {
            step: 1,
        },
    };

    private readonly allFacets: {[key: string]: NaturalSearchFacets} = {
        users: [
            this.userTags,
            {
                display: 'Réservation en cours (tag)',
                field: 'custom',
                name: 'hasBookingWithTaggedBookable',
                transform: replaceOperatorByName,
                component: TypeNaturalSelectComponent,
                configuration: {
                    service: this.bookableTagService,
                    placeholder: 'Tag de réservable',
                },
            } as DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>>,
            {
                display: 'Réservation en cours (bookable)',
                field: 'custom',
                name: 'hasBookingWithBookable',
                transform: replaceOperatorByName,
                component: TypeNaturalSelectComponent,
                configuration: {
                    service: this.bookableService,
                    placeholder: 'Réservable',
                    filter: {
                        groups: [
                            {
                                conditions: [
                                    {
                                        bookingType: {equal: {value: BookingType.admin_only}},
                                        isActive: {equal: {value: true}},
                                    },
                                ],
                            },
                        ],
                    } as BookableFilter,
                },
            } as DropdownFacet<TypeSelectNaturalConfiguration<BookableService>>,
            {
                display: 'Nombre de sorties',
                field: 'bookingCount',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                    min: 0,
                },
                transform: prefixOperatorWithField,
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Date de sortie',
                field: 'bookingDate',
                component: TypeDateComponent,
                transform: prefixOperatorWithField,
            } as DropdownFacet<TypeDateConfiguration>,
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

            this.licenses,
            this.receivesNewsletter,

            this.userWelcomeSession,

            {
                display: "Date d'accueil",
                field: 'welcomeSessionDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,

            {
                display: 'Mode de paiement',
                field: 'billingType',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('BillingType'),
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Solde',
                field: 'balance',
                component: TypeNumberComponent,
                configuration: {
                    step: 0.01,
                },
            } as DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Date de naissance',
                field: 'birthday',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            this.creationDate,
            this.updateDate,
            {
                display: 'Date de démission',
                field: 'resignDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
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
                showValidateButton: true,
                configuration: {
                    key: 'account',
                    service: this.accountService,
                    config: accountHierarchicConfiguration,
                },
            } as DropdownFacet<TypeHierarchicSelectorConfiguration>,
            {
                display: 'Compte au crédit',
                field: 'credit',
                component: TypeHierarchicSelectorComponent,
                showValidateButton: true,
                configuration: {
                    key: 'account',
                    service: this.accountService,
                    config: accountHierarchicConfiguration,
                },
            } as DropdownFacet<TypeHierarchicSelectorConfiguration>,
            {
                display: 'Date de transaction',
                field: 'transactionDate',
                component: TypeDateComponent,
            } as DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Justificatif',
                field: 'custom',
                component: TypeSelectComponent,
                name: 'transactionWithDocument',
                transform: replaceOperatorByName,
                configuration: {
                    items: [
                        {value: true, name: 'Avec'},
                        {value: false, name: 'Sans'},
                    ],
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            this.bookable,
            this.transactionTags,
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
                configuration: {
                    service: this.userService,
                    placeholder: 'Utilisateur',
                },
            } as DropdownFacet<TypeSelectNaturalConfiguration<UserService>>,
            this.creationDate,
            this.updateDate,
        ],
        bookables: [
            this.name,
            this.code,
            this.bookableTags,
            this.isActive,
            this.bookingType,
            this.initialPrice,
            this.periodicPrice,
            this.purchasePrice,
            this.simultaneousBookingMaximum,
            this.creationDate,
            this.updateDate,
        ],
        equipment: [
            this.name,
            this.code,
            this.bookableTags,
            this.isActive,
            this.purchasePrice,
            this.simultaneousBookingMaximum,
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
                },
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
                },
            } as DropdownFacet<TypeSelectConfiguration>,
            this.owner,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('ExpenseClaimStatus'),
                },
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
        logs: [this.creationDate, this.creator, this.message],
    };

    constructor(
        private readonly enumService: NaturalEnumService,
        private readonly userTagService: UserTagService,
        private readonly transactionService: TransactionService,
        private readonly transactionTagService: TransactionTagService,
        private readonly bookableService: BookableService,
        private readonly bookableTagService: BookableTagService,
        private readonly accountService: AccountService,
        private readonly userService: UserService,
        private readonly licenceService: LicenseService,
    ) {}

    /**
     * Returns the natural search configuration for given, or null if non-existent
     */
    public get(key: string): NaturalSearchFacets {
        return this.allFacets[key] || [];
    }
}
