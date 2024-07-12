import {AccountService} from '../../admin/accounts/services/account.service';
import {AccountType} from '../generated-types';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';

export const groupAccountHierarchicConfiguration: NaturalHierarchicConfiguration[] = [
    {
        service: AccountService,
        filter: {groups: [{conditions: [{type: {equal: {value: AccountType.Group}}}]}]}, // only accounts of type Group
        parentsRelationNames: ['parent'],
        childrenRelationNames: ['parent'],
        selectableAtKey: 'account',
    },
];
