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
                output: 'string',
                input: 'string | Date',
            },
            Color: 'string',
            Date: {
                output: 'string',
                input: 'string | Date',
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
            AccountingDocumentID: 'string | any',
            AccountID: 'string | any',
            BookableMetadataID: 'string | any',
            BookableID: 'string | any',
            BookableTagID: 'string | any',
            BookingID: 'string | any',
            CountryID: 'string | any',
            ExpenseClaimID: 'string | any',
            ImageID: 'string | any',
            LicenseID: 'string | any',
            MessageID: 'string | any',
            TransactionLineID: 'string | any',
            TransactionID: 'string | any',
            TransactionTagID: 'string | any',
            UserID: 'string | any',
            UserTagID: 'string | any',
            LogID: 'string | any',
        },
    },
};

export default config;
