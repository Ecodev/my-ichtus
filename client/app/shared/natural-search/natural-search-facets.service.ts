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
import {
    BookableFilter,
    BookingFilterGroupConditionEndDate,
    UserFilterGroupConditionReceivesNewsletter,
    UserFilterGroupConditionWelcomeSessionDate,
} from '../generated-types';
import {AccountService} from '../../admin/accounts/services/account.service';
import {accountHierarchicConfiguration} from '../hierarchic-selector/AccountHierarchicConfiguration';
import {BookableTagService} from '../../admin/bookableTags/services/bookableTag.service';
import {ExpenseClaimService} from '../../admin/expenseClaim/services/expenseClaim.service';

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

    private readonly userWelcomeSession: FlagFacet<UserFilterGroupConditionWelcomeSessionDate> = {
        display: "N'a pas été accueilli",
        name: 'userWelcomeSession',
        field: 'welcomeSessionDate',
        condition: {null: {}},
    };

    private readonly receivesNewsletter: FlagFacet<UserFilterGroupConditionReceivesNewsletter> = {
        display: 'Abonné newsletter',
        field: 'receivesNewsletter',
        condition: {equal: {value: true}},
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

    private readonly startDate: DropdownFacet<TypeDateConfiguration> = {
        display: 'Date de début',
        field: 'startDate',
        component: TypeDateComponent,
    };

    private readonly endDate: DropdownFacet<TypeDateConfiguration> = {
        display: 'Date de fin',
        field: 'endDate',
        component: TypeDateComponent,
    };

    private readonly destination: DropdownFacet<never> = {
        display: 'Destination',
        field: 'destination',
        component: TypeTextComponent,
        transform: wrapLike,
    };

    private readonly participantCount: DropdownFacet<TypeNumberConfiguration> = {
        display: 'Nb de participants',
        field: 'participantCount',
        component: TypeNumberComponent,
        configuration: {
            step: 1,
        },
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

    private readonly bookableActiveBookingCount: DropdownFacet<TypeNumberConfiguration> = {
        display: 'Réservations simultanées',
        field: 'bookableBookingCount',
        component: TypeNumberComponent,
        transform: prefixOperatorWithField,
        configuration: {
            step: 1,
        },
    };

    private readonly bokingBookableTag: DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>> = {
        display: 'Tag de réservable',
        field: 'bookable.bookableTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.bookableTagService,
            placeholder: 'Tag de réservable',
        },
    };

    private readonly internalRemarks: DropdownFacet<never> = {
        display: 'Remarques internes',
        field: 'internalRemarks',
        component: TypeTextComponent,
        transform: wrapLike,
    };

    private readonly allFacets: {[key: string]: NaturalSearchFacets} = {
        users: [
            this.userTags,

            {
                display: 'Réservation (réservable)',
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
                                        isActive: {equal: {value: true}},
                                    },
                                ],
                            },
                        ],
                    } satisfies BookableFilter,
                },
            } satisfies DropdownFacet<TypeSelectNaturalConfiguration<BookableService>>,
            {
                display: 'Réservation (statut)',
                field: 'custom',
                name: 'hasBookingStatus',
                transform: replaceOperatorByName,
                component: TypeSelectComponent,
                configuration: {items: this.enumService.get('BookingStatus')},
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Réservation (état)',
                field: 'custom',
                name: 'hasBookingCompleted',
                transform: replaceOperatorByName,
                component: TypeSelectComponent,
                configuration: {
                    items: [
                        {value: true, name: 'Terminé'},
                        {value: false, name: 'En cours'},
                    ],
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Réservation (tag de réservable)',
                field: 'custom',
                name: 'hasBookingWithTaggedBookable',
                transform: replaceOperatorByName,
                component: TypeNaturalSelectComponent,
                configuration: {
                    service: this.bookableTagService,
                    placeholder: 'Tag de réservable',
                },
            } satisfies DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>>,
            {
                display: `N'importe quelle autre réservation (tag de réservable)`,
                field: 'custom',
                name: 'hasAnyBookingWithTaggedBookable',
                transform: (selection: NaturalSearchSelection) => {
                    selection.name = 'hasBookingWithTaggedBookable';
                    selection = replaceOperatorByName(selection);

                    const field = selection.condition.hasBookingWithTaggedBookable;
                    if (field) {
                        field.sameBooking = false;
                    }

                    return selection;
                },
                component: TypeNaturalSelectComponent,
                configuration: {
                    service: this.bookableTagService,
                    placeholder: 'Tag de réservable',
                },
            } satisfies DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>>,
            {
                display: 'Nombre de sorties',
                field: 'bookingCount',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                    min: 0,
                },
                transform: prefixOperatorWithField,
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Date de sortie',
                field: 'bookingDate',
                component: TypeDateComponent,
                transform: prefixOperatorWithField,
            } satisfies DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('UserStatus'),
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Rôle',
                field: 'role',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('UserRole'),
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            this.licenses,
            this.receivesNewsletter,
            this.userWelcomeSession,
            {
                display: "Date d'accueil",
                name: 'welcomeSessionDate',
                field: 'welcomeSessionDate',
                component: TypeDateComponent,
            } satisfies DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Mode de paiement',
                field: 'billingType',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('BillingType'),
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Solde',
                field: 'accountBalance',
                component: TypeNumberComponent,
                transform: prefixOperatorWithField,
                configuration: {
                    step: 0.01,
                },
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            this.internalRemarks,
            {
                display: 'Date de naissance',
                field: 'birthday',
                component: TypeDateComponent,
            } satisfies DropdownFacet<TypeDateConfiguration>,
            this.creationDate,
            this.updateDate,
            {
                display: 'Date de démission',
                field: 'resignDate',
                component: TypeDateComponent,
            } satisfies DropdownFacet<TypeDateConfiguration>,
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
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Compte',
                field: 'custom',
                name: 'creditOrDebitAccount',
                component: TypeHierarchicSelectorComponent,
                transform: replaceOperatorByName,
                showValidateButton: true,
                configuration: {
                    key: 'account',
                    service: this.accountService,
                    config: accountHierarchicConfiguration,
                },
            } satisfies DropdownFacet<TypeHierarchicSelectorConfiguration>,
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
            } satisfies DropdownFacet<TypeHierarchicSelectorConfiguration>,
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
            } satisfies DropdownFacet<TypeHierarchicSelectorConfiguration>,
            {
                display: 'Date de transaction',
                field: 'transactionDate',
                component: TypeDateComponent,
            } satisfies DropdownFacet<TypeDateConfiguration>,
            {
                display: 'Pointé',
                field: 'isReconciled',
                component: TypeSelectComponent,
                name: 'isReconciled',
                configuration: {
                    items: [
                        {value: true, name: 'Oui'},
                        {value: false, name: 'Non'},
                    ],
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Justificatif',
                field: 'custom',
                name: 'transactionWithDocument',
                transform: replaceOperatorByName,
                component: TypeSelectComponent,
                configuration: {
                    items: [
                        {value: true, name: 'Avec'},
                        {value: false, name: 'Sans'},
                    ],
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            this.bookable,
            this.transactionTags,
            this.owner,
            this.creationDate,
            this.updateDate,
        ],
        storage: [
            this.name,
            this.code,
            this.bookableActiveBookingCount,
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
            } satisfies DropdownFacet<TypeSelectNaturalConfiguration<UserService>>,
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
            this.bookableActiveBookingCount,
            this.creationDate,
            this.updateDate,
        ],
        admin_approved: [
            this.name,
            this.code,
            this.bookableTags,
            this.isActive,
            this.initialPrice,
            this.bookableActiveBookingCount,
            this.creationDate,
            this.updateDate,
        ],
        equipment: [
            this.name,
            this.code,
            this.bookableTags,
            this.isActive,
            this.purchasePrice,
            this.bookableActiveBookingCount,
            this.creationDate,
            this.updateDate,
        ],
        bookingsForBookable: [this.owner, this.bookable, this.creationDate, this.updateDate],
        bookings: [
            this.owner,
            this.bookable,
            this.startDate,
            this.endDate,
            this.bokingBookableTag,
            this.destination,
            this.participantCount,
            this.creationDate,
            this.updateDate,
        ],
        bookingsAdvanced: [
            this.owner,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {items: this.enumService.get('BookingStatus')},
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'En cours',
                field: 'endDate',
                condition: {null: {}},
            } satisfies FlagFacet<BookingFilterGroupConditionEndDate>,
            this.bokingBookableTag,
            this.bookable,
            this.startDate,
            this.endDate,
            this.destination,
            this.participantCount,
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
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Solde',
                field: 'balance',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Budget prévu',
                field: 'budgetAllowed',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Budget restant',
                field: 'budgetBalance',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } satisfies DropdownFacet<TypeNumberConfiguration>,
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
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            this.owner,
            {
                display: 'Statut',
                field: 'status',
                component: TypeSelectComponent,
                configuration: {
                    items: this.enumService.get('ExpenseClaimStatus'),
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'Montant',
                field: 'amount',
                component: TypeNumberComponent,
                configuration: {
                    step: 1,
                },
            } satisfies DropdownFacet<TypeNumberConfiguration>,
            {
                display: 'Secteur concerné',
                field: 'sector',
                component: TypeSelectComponent,
                configuration: {
                    items: this.expenseClaimService.getSectors(),
                },
            } satisfies DropdownFacet<TypeSelectConfiguration>,
            {
                display: 'À approuver',
                field: 'custom',
                name: 'expenseClaimToReview',
                condition: {in: {}},
                transform: replaceOperatorByName,
            } satisfies FlagFacet<{in: Record<string, never>}>,
            this.creationDate,
            this.updateDate,
        ],
        logs: [this.creationDate, this.creator, this.message],
    };

    public constructor(
        private readonly enumService: NaturalEnumService,
        private readonly userTagService: UserTagService,
        private readonly transactionService: TransactionService,
        private readonly transactionTagService: TransactionTagService,
        private readonly bookableService: BookableService,
        private readonly bookableTagService: BookableTagService,
        private readonly accountService: AccountService,
        private readonly userService: UserService,
        private readonly licenceService: LicenseService,
        private readonly expenseClaimService: ExpenseClaimService,
    ) {}

    /**
     * Returns the natural search configuration for given, or null if non-existent
     */
    public get(key: string): NaturalSearchFacets {
        return this.allFacets[key] || [];
    }
}
