import {Apollo, gql} from 'apollo-angular';
import {Component, DOCUMENT, inject, Input} from '@angular/core';
import {
    BankingInfosForExportQuery,
    BankingInfosQuery,
    BankingInfosQueryVariables,
} from '../../../shared/generated-types';
import {copyToClipboard, NaturalIconDirective} from '@ecodev/natural';
import {IbanPipe} from '../../../shared/pipes/iban.pipe';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

const queryForInfos = gql`
    query BankingInfosQuery($user: UserID!, $amount: Money) {
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
    query BankingInfosForExportQuery($user: UserID!, $amount: Money) {
        bankingInfos(user: $user, amount: $amount) {
            qrBill
        }
    }
`;

@Component({
    selector: 'app-bvr',
    imports: [MatProgressSpinner, MatIconButton, MatTooltip, MatIcon, NaturalIconDirective, IbanPipe],
    templateUrl: './bvr.component.html',
    styleUrl: './bvr.component.scss',
})
export class BvrComponent {
    private readonly apollo = inject(Apollo);
    private readonly document = inject(DOCUMENT);

    @Input() public set bankingData(data: BankingInfosQueryVariables) {
        this.variables = data;
        this.apollo
            .query<BankingInfosQuery, BankingInfosQueryVariables>({
                query: queryForInfos,
                fetchPolicy: 'cache-first',
                variables: this.variables,
            })
            .subscribe(result => (this.bankingInfos = result.data.bankingInfos));
    }

    private variables!: BankingInfosQueryVariables;
    public bankingInfos: BankingInfosQuery['bankingInfos'] | null = null;

    protected copyToClipboard(text: string): void {
        copyToClipboard(this.document, text);
    }

    public exportBill(): void {
        this.apollo
            .query<BankingInfosForExportQuery, BankingInfosQueryVariables>({
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
