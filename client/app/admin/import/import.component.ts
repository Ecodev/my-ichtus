import {Apollo, gql} from 'apollo-angular';
import {Component, inject, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ImportCamt, ImportCamtVariables} from '../../shared/generated-types';
import {
    NaturalAlertService,
    NaturalFileSelectDirective,
    NaturalIconDirective,
    NaturalSearchSelections,
    NaturalSeoResolveData,
    toUrl,
} from '@ecodev/natural';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-import',
    imports: [MatButton, NaturalFileSelectDirective, MatIcon, NaturalIconDirective, AsyncPipe],
    templateUrl: './import.component.html',
    styleUrl: './import.component.scss',
})
export class ImportComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    public readonly permissionsService = inject(PermissionsService);
    private readonly apollo = inject(Apollo);
    private readonly alertService = inject(NaturalAlertService);

    /**
     * Data attribute provided by activated route snapshot
     */
    public routeData!: NaturalSeoResolveData;

    public importing = false;
    public error: Error | null = null;

    public ngOnInit(): void {
        this.routeData = this.route.snapshot.data as NaturalSeoResolveData;
    }

    protected uploadFile(file: File): void {
        this.importing = true;
        this.error = null;

        const m = gql`
            mutation ImportCamt($file: Upload!) {
                importCamt(file: $file) {
                    id
                }
            }
        `;

        this.apollo
            .mutate<ImportCamt, ImportCamtVariables>({
                mutation: m,
                variables: {
                    file: file,
                },
            })
            .subscribe({
                next: result => {
                    const importCamt = result.data!.importCamt;
                    const naturalSearchSelections: NaturalSearchSelections = [
                        importCamt.map(transaction => {
                            return {
                                field: 'transaction',
                                condition: {
                                    have: {
                                        values: [transaction.id],
                                    },
                                },
                            };
                        }),
                    ];

                    const ns = JSON.stringify(toUrl(naturalSearchSelections));
                    this.importing = false;
                    this.alertService.info(importCamt.length + ' transactions importées', 5000);
                    this.router.navigate(['/admin/transaction-line', {ns}]);
                },
                error: error => {
                    this.error = error;
                    this.importing = false;
                },
            });
    }
}
