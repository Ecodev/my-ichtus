import { Component, Input } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { BankingInfos, BankingInfos_bankingInfos, BankingInfosVariables } from '../../../shared/generated-types';

const q = gql`
    query BankingInfos($user: UserID!, $amount: Money) {
        bankingInfos(user: $user, amount: $amount) {
            referenceNumber
            encodingLine
            postAccount
            paymentTo
            paymentFor
        }
    }`;

@Component({
    selector: 'app-bvr',
    templateUrl: './bvr.component.html',
    styleUrls: ['./bvr.component.scss'],
})
export class BvrComponent {

    @Input() set bankingData(data: BankingInfosVariables) {

        this.apollo.query<BankingInfos, BankingInfosVariables>({
            query: q,
            fetchPolicy: 'cache-first',
            variables: data,
        }).subscribe(result => this.bankingInfos = result.data.bankingInfos);
    }

    public bankingInfos: BankingInfos_bankingInfos;

    constructor(private apollo: Apollo) {

    }
}

