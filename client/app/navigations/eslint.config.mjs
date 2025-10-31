import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    {languageOptions: {globals: globals.browser}},
    pluginJs.configs.recommended,
    {
        rules: {
            'no-var': 'error',
            'no-unexpected-multiline': 'off', // Prettier disagrees
            'prefer-const': 'error',
        },
    },
];
