import {Apollo, gql} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {ImportCamt, ImportCamtVariables} from '../../shared/generated-types';
import {
    NaturalAlertService,
    NaturalSearchSelections,
    toUrl,
    NaturalFileSelectDirective,
    NaturalIconDirective,
} from '@ecodev/natural';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
    standalone: true,
    imports: [FlexModule, MatButtonModule, NaturalFileSelectDirective, MatIconModule, NaturalIconDirective, NgIf],
})
export class ImportComponent implements OnInit {
    /**
     * Data attribute provided by activated route snapshot
     */
    public routeData!: Data;

    public importing = false;
    public error: Error | null = null;

    public constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        public readonly permissionsService: PermissionsService,
        private readonly apollo: Apollo,
        private readonly alertService: NaturalAlertService,
    ) {}

    public ngOnInit(): void {
        this.routeData = this.route.snapshot.data;
    }

    public uploadFile(file: File): void {
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
