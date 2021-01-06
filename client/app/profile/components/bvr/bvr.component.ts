import {gql, Apollo} from 'apollo-angular';
import {Component, Input} from '@angular/core';
import {
    BankingInfos,
    BankingInfosForExport,
    BankingInfos_bankingInfos,
    BankingInfosVariables,
} from '../../../shared/generated-types';
import {copyToClipboard} from '../../../shared/utils';

const queryForInfos = gql`
    query BankingInfos($user: UserID!, $amount: Money) {
        bankingInfos(user: $user, amount: $amount) {
            referenceNumber
            paymentTo
            paymentFor
            iban
            qrCode
        }
    }
`;

const queryForExport = gql`
    query BankingInfosForExport($user: UserID!, $amount: Money) {
        bankingInfos(user: $user, amount: $amount) {
            qrBill
        }
    }
`;

@Component({
    selector: 'app-bvr',
    templateUrl: './bvr.component.html',
    styleUrls: ['./bvr.component.scss'],
})
export class BvrComponent {
    @Input() set bankingData(data: BankingInfosVariables) {
        this.variables = data;
        this.apollo
            .query<BankingInfos, BankingInfosVariables>({
                query: queryForInfos,
                fetchPolicy: 'cache-first',
                variables: this.variables,
            })
            .subscribe(result => (this.bankingInfos = result.data.bankingInfos));
    }

    private variables: BankingInfosVariables;
    public bankingInfos: BankingInfos_bankingInfos;

    constructor(private apollo: Apollo) {}

    public copyToClipboard(text: string): void {
        copyToClipboard(text);
    }

    public exportBill(): void {
        this.apollo
            .query<BankingInfosForExport, BankingInfosVariables>({
                query: queryForExport,
                fetchPolicy: 'cache-first',
                variables: this.variables,
            })
            .subscribe(result => {
                if (result.data.bankingInfos.qrBill) {
                    window.location.href = result.data.bankingInfos.qrBill;
                }
            });
    }
}
