import {AsyncPipe} from '@angular/common';
import {Component, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
    type FilterGroupConditionField,
    formatIsoDate,
    ignoreErrors,
    NaturalErrorMessagePipe,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
    type NaturalSearchSelection,
    toNavigationParameters,
    TypedMatCellDef,
} from '@ecodev/natural';
import {gql} from '@apollo/client';
import {Apollo} from 'apollo-angular';
import {EMPTY, startWith} from 'rxjs';
import {catchError, filter, finalize, switchMap} from 'rxjs/operators';
import {
    type ExportIndicatorReport,
    type ExportIndicatorReportVariables,
    type IndicatorReportQuery,
    type IndicatorReportQueryVariables,
} from '../../shared/generated-types';
import {MoneyComponent} from '../../shared/components/money/money.component';
import {PermissionsService} from '../../shared/services/permissions.service';

type IndicatorReportRow = IndicatorReportQuery['indicatorReport'][0];
const indicatorQuery = gql`
    query IndicatorReportQuery($dateFrom: Date, $dateTo: Date) {
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
    mutation ExportIndicatorReport($dateFrom: Date, $dateTo: Date) {
        exportIndicatorReport(dateFrom: $dateFrom, dateTo: $dateTo)
    }
`;

function linkToTransactionLines(selections: NaturalSearchSelection[]): RouterLink['routerLink'] {
    return ['/admin/transaction-line', toNavigationParameters([selections])];
}

@Component({
    selector: 'app-indicator-report',
    imports: [
        AsyncPipe,
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
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class IndicatorReportComponent {
    protected readonly route = inject(ActivatedRoute);
    protected readonly permissionsService = inject(PermissionsService);
    private readonly apollo = inject(Apollo);
    private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

    protected readonly columns: string[] = ['name', 'value', 'budgetAllowed', 'budgetBalance', 'formula'];
    protected readonly today = this.dateAdapter.today();
    private readonly firstDayOfCurrentYear = this.dateAdapter.createDate(this.today.getFullYear(), 0, 1);

    /**
     * Without a start date, indicators show everything that happened until the end date. With one,
     * they show what happened in between, and the current year is the period we look at the most.
     * Without an end date, the period runs up to now.
     */
    protected readonly form = new FormGroup({
        dateFrom: new FormControl<Date | null>(this.firstDayOfCurrentYear),
        dateTo: new FormControl<Date | null>(null),
    });

    protected readonly exporting = signal(false);
    protected readonly nonReconciledLink = linkToTransactionLines([
        {
            field: 'isReconciled',
            condition: {in: {values: [false]}},
        },
    ]);

    protected dataSource: MatTableDataSource<IndicatorReportRow> | null = null;

    public constructor() {
        this.getReport();
    }

    protected clearDateFrom(): void {
        this.form.controls.dateFrom.setValue(null);
    }

    protected clearDateTo(): void {
        this.form.controls.dateTo.setValue(null);
    }

    /**
     * Which way the only date that is entered can be moved, so that a period open on one side can
     * be opened on the other without typing the date again. Null while both fields are filled or
     * both are empty, as there is then nothing to move.
     */
    protected getMoveDateDirection(): 'toDateFrom' | 'toDateTo' | null {
        const dateFrom = this.form.controls.dateFrom.value;
        const dateTo = this.form.controls.dateTo.value;

        if (dateFrom && !dateTo) {
            return 'toDateTo';
        }

        if (dateTo && !dateFrom) {
            return 'toDateFrom';
        }

        return null;
    }

    /**
     * Moving the only date that is entered shows the other half of what the report was showing, so
     * the date shifts by a day to pick up right where the period it replaces stopped. An end date on
     * the 2nd totals everything up to that evening, and becomes a start date on the 3rd.
     */
    protected moveDate(): void {
        const {dateFrom, dateTo} = this.form.getRawValue();

        // Both fields are set at once, so that the report is asked for only once
        this.form.setValue({
            dateFrom: dateTo ? this.dateAdapter.addCalendarDays(dateTo, 1) : null,
            dateTo: dateFrom ? this.dateAdapter.addCalendarDays(dateFrom, -1) : null,
        });
    }

    protected getAccountLink(accountId: string): RouterLink['routerLink'] {
        return linkToTransactionLines([
            {
                field: 'custom',
                name: 'account',
                condition: {
                    have: {
                        values: [accountId],
                        recursive: true,
                    },
                } as FilterGroupConditionField,
            },
            ...this.getDateSelections(),
        ]);
    }

    protected formatMultiplier(multiplier: number): string {
        return multiplier === 100 ? '' : ` (${multiplier}%)`;
    }

    protected export(): void {
        this.exporting.set(true);

        this.apollo
            .mutate<ExportIndicatorReport, ExportIndicatorReportVariables>({
                mutation: exportIndicatorReport,
                variables: this.getVariables(),
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
                    this.apollo
                        .query<IndicatorReportQuery, IndicatorReportQueryVariables>({
                            query: indicatorQuery,
                            variables: this.getVariables(),
                        })
                        // A failed query must not terminate the subscription, or later date changes would be ignored
                        .pipe(catchError(() => EMPTY)),
                ),
                ignoreErrors(),
            )
            .subscribe(result => {
                this.dataSource = new MatTableDataSource<IndicatorReportRow>(result.data.indicatorReport);
            });
    }

    private getVariables(): IndicatorReportQueryVariables {
        const dateFrom = this.form.controls.dateFrom.value;
        const dateTo = this.form.controls.dateTo.value;

        return {
            dateFrom: dateFrom ? formatIsoDate(dateFrom) : null,
            dateTo: dateTo ? formatIsoDate(dateTo) : null,
        };
    }

    private getDateSelections(): NaturalSearchSelection[] {
        const dateFrom = this.form.controls.dateFrom.value;
        const dateTo = this.form.controls.dateTo.value;
        const selections: NaturalSearchSelection[] = [];

        if (dateFrom) {
            selections.push({
                field: 'transactionDate',
                condition: {greaterOrEqual: {value: formatIsoDate(dateFrom)}},
            });
        }

        if (dateTo) {
            selections.push({
                field: 'transactionDate',
                condition: {lessOrEqual: {value: formatIsoDate(dateTo)}},
            });
        }

        return selections;
    }
}
