import {AccountService} from '../../admin/accounts/services/account.service';
import {AccountType} from '../generated-types';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';

export function accountHierarchicConfiguration(
    allowed: AccountType[] = [
        AccountType.Asset,
        AccountType.Equity,
        AccountType.Expense,
        AccountType.Liability,
        AccountType.Revenue,
    ],
): NaturalHierarchicConfiguration[] {
    return [
        {
            service: AccountService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'account',
            isSelectableCallback: account => allowed.includes(account.type),
        },
    ];
}
