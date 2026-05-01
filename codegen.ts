import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'client/app/shared/generated-schema.graphql',
    documents: 'client/**/*.ts',
    generates: {
        'client/app/shared/generated-types.ts': {
            // preset: 'near-operation-file',
            plugins: [
                'typescript',
                'typescript-operations',
                {
                    add: {
                        content: '/* eslint-disable */',
                    },
                },
            ],
        },
    },
    hooks: {
        afterAllFileWrite: ["prettier --experimental-cli --ignore-path '' --write"],
    },
    config: {
        // immutableTypes:true, // TODO enable this when we have time
        onlyOperationTypes: true, // Simplifies the generated types
        preResolveTypes: true, // Simplifies the generated types
        namingConvention: 'keep', // Keeps naming as-is
        arrayInputCoercion: false,
        strictScalars: true,
        avoidOptionals: {field: true}, // Avoids optionals on the level of the field
        nonOptionalTypename: true, // Forces `__typename` on all selection sets
        skipTypeNameForRoot: true, // Don't generate __typename for root types
        omitOperationSuffix: true,
        scalars: {
            Chronos: {
                input: 'string | Date',
                output: 'string',
            },
            Color: 'string',
            Date: {
                input: 'string | Date',
                output: 'string',
            },
            Email: 'string',
            Login: 'string',
            Money: 'string',
            Password: 'string',
            Token: 'string',
            Upload: 'File',
            Url: 'string',

            // All IDs
            // Ideally we should not use `any` at all, but we want to be able
            // to use either a string or an entire subobject.
            AccountingDocumentID: {
                input: 'string | any',
                output: 'string',
            },
            AccountID: {
                input: 'string | any',
                output: 'string',
            },
            BookableMetadataID: {
                input: 'string | any',
                output: 'string',
            },
            BookableID: {
                input: 'string | any',
                output: 'string',
            },
            BookableTagID: {
                input: 'string | any',
                output: 'string',
            },
            BookingID: {
                input: 'string | any',
                output: 'string',
            },
            CountryID: {
                input: 'string | any',
                output: 'string',
            },
            ExpenseClaimID: {
                input: 'string | any',
                output: 'string',
            },
            ImageID: {
                input: 'string | any',
                output: 'string',
            },
            IndicatorDefinitionID: {
                input: 'string | any',
                output: 'string',
            },
            LicenseID: {
                input: 'string | any',
                output: 'string',
            },
            MessageID: {
                input: 'string | any',
                output: 'string',
            },
            TransactionLineID: {
                input: 'string | any',
                output: 'string',
            },
            TransactionID: {
                input: 'string | any',
                output: 'string',
            },
            TransactionTagID: {
                input: 'string | any',
                output: 'string',
            },
            UserID: {
                input: 'string | any',
                output: 'string',
            },
            UserTagID: {
                input: 'string | any',
                output: 'string',
            },
            LogID: {
                input: 'string | any',
                output: 'string',
            },
        },
    },
};

export default config;
