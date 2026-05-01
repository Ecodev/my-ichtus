import {AsyncPipe, DatePipe} from '@angular/common';
import {Component, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DateAdapter} from '@angular/material/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {
    MatCell,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource,
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
    formatIsoDate,
    NaturalErrorMessagePipe,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
    type NaturalSearchSelection,
    toNavigationParameters,
    TypedMatCellDef,
} from '@ecodev/natural';
import {gql} from '@apollo/client/core';
import {Apollo} from 'apollo-angular';
import {filter, finalize, startWith, switchMap} from 'rxjs';
import type {
    ExportIndicatorReport,
    ExportIndicatorReportVariables,
    IndicatorReportQuery,
    IndicatorReportQueryVariables,
} from '../../shared/generated-types';
import {MoneyComponent} from '../../shared/components/money/money.component';
import {PermissionsService} from '../../shared/services/permissions.service';

type IndicatorReportRow = IndicatorReportQuery['indicatorReport'][0];
const indicatorQuery = gql`
    query IndicatorReportQuery($dateFrom: Date!, $dateTo: Date) {
        indicatorReport(dateFrom: $dateFrom, dateTo: $dateTo) {
            indicatorDefinition {
                id
                name
                addends {
                    multiplier
                    account {
                        id
                        name
                    }
                }
                subtrahends {
                    multiplier
                    account {
                        id
                        name
                    }
                }
            }
            value
            budgetAllowed
            budgetBalance
        }
    }
`;

const exportIndicatorReport = gql`
    mutation ExportIndicatorReport($dateFrom: Date!, $dateTo: Date) {
        exportIndicatorReport(dateFrom: $dateFrom, dateTo: $dateTo)
    }
`;

function linkToTransactionLines(selection: NaturalSearchSelection): RouterLink['routerLink'] {
    return ['/admin/transaction-line', toNavigationParameters([[selection]])];
}

@Component({
    selector: 'app-indicator-report',
    imports: [
        AsyncPipe,
        DatePipe,
        FormsModule,
        MatButton,
        MatCell,
        MatColumnDef,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatError,
        MatFormField,
        MatHeaderCell,
        MatHeaderCellDef,
        MatHeaderRow,
        MatHeaderRowDef,
        MatIcon,
        MatIconButton,
        MatInput,
        MatLabel,
        MatRow,
        MatRowDef,
        MatSuffix,
        MatTable,
        MatTooltip,
        MoneyComponent,
        NaturalErrorMessagePipe,
        NaturalFixedButtonComponent,
        NaturalIconDirective,
        ReactiveFormsModule,
        RouterLink,
        TypedMatCellDef,
    ],
    templateUrl: './indicator-report.component.html',
    styleUrl: './indicator-report.component.scss',
})
export class IndicatorReportComponent {
    protected readonly route = inject(ActivatedRoute);
    protected readonly permissionsService = inject(PermissionsService);
    private readonly apollo = inject(Apollo);
    private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

    protected readonly columns: string[] = ['name', 'value', 'budgetAllowed', 'budgetBalance', 'formula'];
    protected readonly today = this.dateAdapter.today();
    protected readonly firstDayOfCurrentYear = this.dateAdapter.createDate(this.today.getFullYear(), 0, 1);
    protected readonly form = new FormGroup({
        dateFrom: new FormControl(this.firstDayOfCurrentYear, {validators: [Validators.required], nonNullable: true}),
        dateTo: new FormControl<Date | null>(null),
    });
    protected readonly exporting = signal(false);
    protected readonly nonReconciledLink = linkToTransactionLines({
        field: 'isReconciled',
        condition: {in: {values: [false]}},
    });

    protected dataSource: MatTableDataSource<IndicatorReportRow> | null = null;

    public constructor() {
        this.getReport();
    }

    protected getAccountLink(accountId: string): RouterLink['routerLink'] {
        return linkToTransactionLines({
            field: 'custom',
            name: 'creditOrDebitAccount',
            condition: {have: {values: [accountId]}},
        });
    }

    protected formatMultiplier(multiplier: number): string {
        return multiplier === 100 ? '' : ` (${multiplier}%)`;
    }

    protected export(): void {
        const variables = this.getVariables();
        if (!variables) {
            return;
        }

        this.exporting.set(true);

        this.apollo
            .mutate<ExportIndicatorReport, ExportIndicatorReportVariables>({
                mutation: exportIndicatorReport,
                variables,
            })
            .pipe(finalize(() => this.exporting.set(false)))
            .subscribe(result => {
                window.location.href = result.data!.exportIndicatorReport;
            });
    }

    private getReport(): void {
        this.form.valueChanges
            .pipe(
                takeUntilDestroyed(),
                startWith(this.form.getRawValue()),
                filter(() => this.form.valid),
                switchMap(() =>
                    this.apollo.query<IndicatorReportQuery, IndicatorReportQueryVariables>({
                        query: indicatorQuery,
                        variables: this.getVariables()!,
                    }),
                ),
            )
            .subscribe(result => {
                this.dataSource = new MatTableDataSource<IndicatorReportRow>(result.data.indicatorReport);
            });
    }

    private getVariables(): IndicatorReportQueryVariables | null {
        const dateFrom = formatIsoDate(this.form.controls.dateFrom.value);
        const dateToValue = this.form.controls.dateTo.value;
        const dateTo = dateToValue ? formatIsoDate(dateToValue) : null;

        if (!dateFrom) {
            return null;
        }

        return {dateFrom, dateTo};
    }
}
