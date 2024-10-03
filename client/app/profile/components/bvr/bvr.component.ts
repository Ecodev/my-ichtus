import {gql, Apollo} from 'apollo-angular';
import {Component, Input, inject} from '@angular/core';
import {BankingInfosForExport, BankingInfos, BankingInfosVariables} from '../../../shared/generated-types';
import {DOCUMENT} from '@angular/common';
import {copyToClipboard, NaturalIconDirective} from '@ecodev/natural';
import {IbanPipe} from '../../../shared/pipes/iban.pipe';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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
    styleUrl: './bvr.component.scss',
    standalone: true,
    imports: [
        MatProgressSpinnerModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        NaturalIconDirective,
        IbanPipe,
    ],
})
export class BvrComponent {
    private readonly apollo = inject(Apollo);
    private readonly document = inject(DOCUMENT);

    @Input() public set bankingData(data: BankingInfosVariables) {
        this.variables = data;
        this.apollo
            .query<BankingInfos, BankingInfosVariables>({
                query: queryForInfos,
                fetchPolicy: 'cache-first',
                variables: this.variables,
            })
            .subscribe(result => (this.bankingInfos = result.data.bankingInfos));
    }

    private variables!: BankingInfosVariables;
    public bankingInfos: BankingInfos['bankingInfos'] | null = null;

    public copyToClipboard(text: string): void {
        copyToClipboard(this.document, text);
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
