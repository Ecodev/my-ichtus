import {Apollo, gql} from 'apollo-angular';
import {Component, OnInit} from '@angular/core';
import {PermissionsService} from '../../shared/services/permissions.service';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {ImportCamt, ImportCamtVariables} from '../../shared/generated-types';
import {NaturalAlertService, NaturalSearchSelections, toUrl} from '@ecodev/natural';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
    /**
     * Data attribute provided by activated route snapshot
     */
    public routeData: Data;

    public importing = false;
    public error: Error | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public permissionsService: PermissionsService,
        private apollo: Apollo,
        private alertService: NaturalAlertService,
    ) {}

    public ngOnInit(): void {
        this.routeData = this.route.snapshot.data;
    }

    uploadFile(file: File): void {
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
            .subscribe(
                result => {
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
                error => {
                    this.error = error;
                    this.importing = false;
                },
            );
    }
}
