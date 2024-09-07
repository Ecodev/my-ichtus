import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    {languageOptions: {globals: globals.browser}},
    pluginJs.configs.recommended,
    {
        rules: {
            'no-var': 'error',
            'no-unused-vars': 'off', // Because we use messy global things, we cannot reliably predict what exists or not
            'no-undef': 'off', // Because we use messy global things, we cannot reliably predict what exists or not
            'no-unexpected-multiline': 'off', // Prettier disagrees
        },
    },
];
