import {assertInInjectionContext, inject} from '@angular/core';
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
import {TransactionTagService} from '../../admin/transactionTags/services/transactionTag.service';
import {
    BookableFilter,
    BookableStatus,
    BookingFilterGroupConditionEndDate,
    UserFilterGroupConditionReceivesNewsletter,
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

function userTags(): DropdownFacet<TypeSelectNaturalConfiguration<UserTagService>> {
    return {
        display: 'Tags',
        field: 'userTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(UserTagService),
            placeholder: 'Tags',
        },
    };
}

function transactionTags(): DropdownFacet<TypeSelectNaturalConfiguration<TransactionTagService>> {
    return {
        display: 'Tags',
        field: 'transactionTag',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(TransactionTagService),
            placeholder: 'Tags',
        },
    };
}

function licenses(): DropdownFacet<TypeSelectNaturalConfiguration<LicenseService>> {
    return {
        display: 'Certifications',
        field: 'licenses',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(LicenseService),
            placeholder: 'Certifications',
        },
    };
}

function bookableTags(): DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>> {
    return {
        display: 'Tags',
        field: 'bookableTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(BookableTagService),
            placeholder: 'Tags',
        },
    };
}

function owner(label = 'Utilisateur'): DropdownFacet<TypeSelectNaturalConfiguration<UserService>> {
    return {
        display: label,
        field: 'owner',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(UserService),
            placeholder: label,
        },
    };
}

const receivesNewsletter: FlagFacet<UserFilterGroupConditionReceivesNewsletter> = {
    display: 'Abonné newsletter',
    field: 'receivesNewsletter',
    condition: {equal: {value: true}},
};

function bookable(): DropdownFacet<TypeSelectNaturalConfiguration<BookableService>> {
    return {
        display: 'Réservable',
        field: 'bookable',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(BookableService),
            placeholder: 'Réservable',
        },
    };
}

const code: DropdownFacet<never> = {
    display: 'Code',
    field: 'code',
    component: TypeTextComponent,
    transform: wrapLike,
};

const name: DropdownFacet<never> = {
    display: 'Nom',
    field: 'name',
    component: TypeTextComponent,
    transform: wrapLike,
};

const creationDate: DropdownFacet<TypeDateConfiguration> = {
    display: 'Date de création',
    field: 'creationDate',
    component: TypeDateComponent,
    configuration: {
        nullable: true,
    },
};

const updateDate: DropdownFacet<TypeDateConfiguration> = {
    display: 'Date de modification',
    field: 'updateDate',
    component: TypeDateComponent,
    configuration: {
        nullable: true,
    },
};

const startDate: DropdownFacet<TypeDateConfiguration> = {
    display: 'Date de début',
    field: 'startDate',
    component: TypeDateComponent,
};

const endDate: DropdownFacet<TypeDateConfiguration> = {
    display: 'Date de fin',
    field: 'endDate',
    component: TypeDateComponent,
    configuration: {
        nullable: true,
    },
};

const destination: DropdownFacet<never> = {
    display: 'Destination',
    field: 'destination',
    component: TypeTextComponent,
    transform: wrapLike,
};

const participantCount: DropdownFacet<TypeNumberConfiguration> = {
    display: 'Nb de participants',
    field: 'participantCount',
    component: TypeNumberComponent,
    configuration: {
        step: 1,
    },
};

function creator(): DropdownFacet<TypeSelectNaturalConfiguration<UserService>> {
    return {
        display: 'Utilisateur',
        field: 'creator',
        component: TypeNaturalSelectComponent,
        configuration: {
            placeholder: 'Utilisateur',
            service: inject(UserService),
        },
    };
}

const message: DropdownFacet<never> = {
    display: 'Message',
    field: 'message',
    component: TypeTextComponent,
    transform: wrapLike,
};

function bookableStatus(): DropdownFacet<TypeSelectConfiguration> {
    return {
        display: `État`,
        field: 'status',
        component: TypeSelectComponent,
        configuration: {
            items: inject(NaturalEnumService).get('BookableStatus'),
        },
    };
}

function bookingType(): DropdownFacet<TypeSelectConfiguration> {
    return {
        display: 'Type de réservation',
        field: 'bookingType',
        component: TypeSelectComponent,
        configuration: {
            items: inject(NaturalEnumService).get('BookingType'),
        },
    };
}

const initialPrice: DropdownFacet<TypeNumberConfiguration> = {
    display: 'Prix initial',
    field: 'initialPrice',
    component: TypeNumberComponent,
    configuration: {
        step: 1,
    },
};

const periodicPrice: DropdownFacet<TypeNumberConfiguration> = {
    display: 'Prix périodique',
    field: 'periodicPrice',
    component: TypeNumberComponent,
    configuration: {
        step: 1,
    },
};

const purchasePrice: DropdownFacet<TypeNumberConfiguration> = {
    display: "Prix d'achat",
    field: 'purchasePrice',
    component: TypeNumberComponent,
    configuration: {
        step: 1,
        nullable: true,
    },
};

const bookableActiveBookingCount: DropdownFacet<TypeNumberConfiguration> = {
    display: 'Réservations simultanées',
    field: 'bookableBookingCount',
    component: TypeNumberComponent,
    transform: prefixOperatorWithField,
    configuration: {
        step: 1,
    },
};

function bookableBookableTag(): DropdownFacet<TypeSelectNaturalConfiguration<BookableTagService>> {
    return {
        display: 'Tag de réservable',
        field: 'bookable.bookableTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: inject(BookableTagService),
            placeholder: 'Tag de réservable',
        },
    };
}

const internalRemarks: DropdownFacet<never> = {
    display: 'Remarques internes',
    field: 'internalRemarks',
    component: TypeTextComponent,
    transform: wrapLike,
};

const remarks: DropdownFacet<never> = {
    display: 'Remarques',
    field: 'remarks',
    component: TypeTextComponent,
    transform: wrapLike,
};

export function users(): NaturalSearchFacets {
    assertInInjectionContext(users);

    return [
        userTags(),
        {
            display: 'Réservation (réservable)',
            field: 'custom',
            name: 'hasBookingWithBookable',
            transform: replaceOperatorByName,
            component: TypeNaturalSelectComponent,
            configuration: {
                service: inject(BookableService),
                placeholder: 'Réservable',
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    status: {equal: {value: BookableStatus.Active}},
                                },
                            ],
                        },
                    ],
                } satisfies BookableFilter,
            },
        } satisfies DropdownFacet<TypeSelectNaturalConfiguration<BookableService>>,
        {
            display: 'Réservation (état)',
            field: 'custom',
            name: 'hasBookingStatus',
            transform: replaceOperatorByName,
            component: TypeSelectComponent,
            configuration: {items: inject(NaturalEnumService).get('BookingStatus')},
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'Réservation (en cours/terminé)',
            field: 'custom',
            name: 'hasBookingCompleted',
            transform: replaceOperatorByName,
            component: TypeSelectComponent,
            configuration: {
                items: [
                    {value: false, name: 'En cours'},
                    {value: true, name: 'Terminé'},
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
                service: inject(BookableTagService),
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
                service: inject(BookableTagService),
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
            display: 'État',
            field: 'status',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('UserStatus'),
            },
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'Rôle',
            field: 'role',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('UserRole'),
            },
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        licenses(),
        receivesNewsletter,
        {
            display: "Date d'accueil",
            field: 'welcomeSessionDate',
            component: TypeDateComponent,
            configuration: {
                nullable: true,
            },
        } satisfies DropdownFacet<TypeDateConfiguration>,
        {
            display: 'Mode de paiement',
            field: 'billingType',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('BillingType'),
            },
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'Date de crédit',
            field: 'hasCreditOnDate',
            component: TypeDateComponent,
            configuration: {nullable: true},
            transform: prefixOperatorWithField,
        } satisfies DropdownFacet<TypeDateConfiguration>,
        {
            display: 'Solde',
            field: 'accountBalance',
            component: TypeNumberComponent,
            transform: prefixOperatorWithField,
            configuration: {
                step: 0.01,
            },
        } satisfies DropdownFacet<TypeNumberConfiguration>,
        internalRemarks,
        owner(),
        {
            display: 'Date de naissance',
            field: 'birthday',
            component: TypeDateComponent,
            configuration: {
                nullable: true,
            },
        } satisfies DropdownFacet<TypeDateConfiguration>,
        creationDate,
        updateDate,
        {
            display: 'Date de démission',
            field: 'resignDate',
            component: TypeDateComponent,
            configuration: {
                nullable: true,
            },
        } satisfies DropdownFacet<TypeDateConfiguration>,
    ];
}

export function transactionLines(): NaturalSearchFacets {
    assertInInjectionContext(transactionLines);

    return [
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
                service: inject(AccountService),
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
                service: inject(AccountService),
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
                service: inject(AccountService),
                config: accountHierarchicConfiguration,
            },
        } satisfies DropdownFacet<TypeHierarchicSelectorConfiguration>,
        {
            display: "Date d'écriture",
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
        transactionTags(),
        remarks,
        bookable(),
        bookableBookableTag(),
        owner(),
        creationDate,
        updateDate,
    ];
}

export function storage(): NaturalSearchFacets {
    assertInInjectionContext(storage);

    return [
        name,
        code,
        bookableActiveBookingCount,
        {
            display: 'Utilisateur',
            field: 'custom',
            name: 'bookableUsage',
            transform: replaceOperatorByName,
            component: TypeNaturalSelectComponent,
            configuration: {
                service: inject(UserService),
                placeholder: 'Utilisateur',
            },
        } satisfies DropdownFacet<TypeSelectNaturalConfiguration<UserService>>,
        creationDate,
        updateDate,
    ];
}

export function bookables(): NaturalSearchFacets {
    assertInInjectionContext(bookables);

    return [
        name,
        code,
        bookableTags(),
        bookableStatus(),
        bookingType(),
        owner('Responsable'),
        initialPrice,
        periodicPrice,
        purchasePrice,
        bookableActiveBookingCount,
        creationDate,
        updateDate,
    ];
}

export function admin_approved(): NaturalSearchFacets {
    assertInInjectionContext(admin_approved);

    return [
        name,
        code,
        owner('Responsable'),
        bookableTags(),
        bookableStatus(),
        initialPrice,
        bookableActiveBookingCount,
        creationDate,
        updateDate,
    ];
}

export function equipment(): NaturalSearchFacets {
    assertInInjectionContext(equipment);

    return [
        name,
        code,
        owner('Responsable'),
        bookableTags(),
        bookableStatus(),
        purchasePrice,
        bookableActiveBookingCount,
        creationDate,
        updateDate,
    ];
}

export function bookingsForBookable(): NaturalSearchFacets {
    assertInInjectionContext(bookingsForBookable);

    return [owner(), bookable(), creationDate, updateDate];
}

export function bookings(): NaturalSearchFacets {
    assertInInjectionContext(bookings);

    return [
        owner(),
        bookable(),
        startDate,
        endDate,
        bookableBookableTag(),
        destination,
        participantCount,
        creationDate,
        updateDate,
    ];
}

export function bookingsAdvanced(): NaturalSearchFacets {
    assertInInjectionContext(bookingsAdvanced);

    return [
        owner(),
        {
            display: 'État',
            field: 'status',
            component: TypeSelectComponent,
            configuration: {items: inject(NaturalEnumService).get('BookingStatus')},
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'En cours',
            field: 'endDate',
            condition: {null: {}},
        } satisfies FlagFacet<BookingFilterGroupConditionEndDate>,
        bookableBookableTag(),
        bookable(),
        startDate,
        endDate,
        destination,
        participantCount,
        creationDate,
        updateDate,
    ];
}

export function accounts(): NaturalSearchFacets {
    assertInInjectionContext(accounts);

    return [
        name,
        code,
        {
            display: 'Type',
            field: 'type',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('AccountType'),
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
                nullable: true,
            },
        } satisfies DropdownFacet<TypeNumberConfiguration>,
        {
            display: 'Budget restant',
            field: 'budgetBalance',
            component: TypeNumberComponent,
            configuration: {
                step: 1,
                nullable: true,
            },
        } satisfies DropdownFacet<TypeNumberConfiguration>,
        owner(),
        creationDate,
        updateDate,
    ];
}

export function expenseClaims(): NaturalSearchFacets {
    assertInInjectionContext(expenseClaims);

    return [
        name,
        {
            display: 'Type',
            field: 'type',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('ExpenseClaimType'),
            },
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        owner(),
        {
            display: 'État',
            field: 'status',
            component: TypeSelectComponent,
            configuration: {
                items: inject(NaturalEnumService).get('ExpenseClaimStatus'),
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
                items: inject(ExpenseClaimService).getSectors(),
            },
        } satisfies DropdownFacet<TypeSelectConfiguration>,
        {
            display: 'À approuver',
            field: 'custom',
            name: 'expenseClaimToReview',
            condition: {in: {}},
            transform: replaceOperatorByName,
        } satisfies FlagFacet<{in: Record<string, never>}>,
        creationDate,
        updateDate,
    ];
}

export function logs(): NaturalSearchFacets {
    assertInInjectionContext(logs);

    return [creationDate, creator(), message];
}
