import { AccountService } from '../../admin/accounts/services/account.service';
import { AccountType } from '../generated-types';
import { NaturalHierarchicConfiguration } from '@ecodev/natural';

export const GroupAccountHierarchicConfiguration: NaturalHierarchicConfiguration[] = [
    {
        service: AccountService,
        filter: {groups: [{conditions: [{type: {equal: {value: AccountType.group}}}]}]}, // only accounts of type Group
        parentsFilters: ['parent'],
        childrenFilters: ['parent'],
        selectableAtKey: 'account',
    },
];
