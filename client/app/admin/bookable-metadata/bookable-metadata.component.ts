import {Component, inject, Input, input, OnInit} from '@angular/core';
import {BookableMetadataService} from './bookable-metadata.service';
import {
    NaturalAlertService,
    NaturalDataSource,
    NaturalIconDirective,
    NaturalQueryVariablesManager,
} from '@ecodev/natural';
import {Bookable, BookableMetadatas, BookableMetadatasVariables} from '../../shared/generated-types';
import {cloneDeep} from 'es-toolkit';
import {finalize} from 'rxjs/operators';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';

@Component({
    selector: 'app-bookable-metadata',
    imports: [
        MatTable,
        MatHeaderCellDef,
        MatColumnDef,
        MatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatRow,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
    ],
    templateUrl: './bookable-metadata.component.html',
    styleUrl: './bookable-metadata.component.scss',
})
export class BookableMetadataComponent implements OnInit {
    private readonly bookableMetaService = inject(BookableMetadataService);
    private readonly alertService = inject(NaturalAlertService);

    public readonly bookable = input.required<Bookable['bookable']>();
    @Input() public edit = false;
    public readonly deleting = new Map<BookableMetadatas['bookableMetadatas']['items'][0], true>();

    public dataSource!: NaturalDataSource<BookableMetadatas['bookableMetadatas']>;

    public columns: string[] = [];

    public ngOnInit(): void {
        if (this.edit) {
            this.columns = ['name', 'value', 'delete'];
        } else {
            this.columns = ['name', 'value'];
        }

        const bookable = this.bookable();
        if (bookable) {
            const variables: BookableMetadatasVariables = {
                filter: {groups: [{conditions: [{bookable: {equal: {value: bookable.id}}}]}]},
            };

            const qvm = new NaturalQueryVariablesManager<BookableMetadatasVariables>();
            qvm.set('variables', variables);

            // TODO : replace by watchAll because two admins may work on same object and meta data could change between two visits
            this.bookableMetaService.getAll(qvm).subscribe(bookables => {
                this.dataSource = new NaturalDataSource<BookableMetadatas['bookableMetadatas']>(cloneDeep(bookables));
                this.addLine();
            });
        } else {
            this.addLine();
        }
    }

    /**
     * Add line if edit mode is true and last item is not already empty
     */
    public addLine(): void {
        if (this.edit && this.dataSource.data) {
            const lastItem = this.dataSource.data.items[this.dataSource.data.items.length - 1];
            if (!lastItem || lastItem.name !== '' || lastItem.value !== '') {
                this.dataSource.push(
                    this.bookableMetaService.getDefaultForServer() as BookableMetadatas['bookableMetadatas']['items'][0],
                );
            }
        }
    }

    public updateOrCreate(meta: BookableMetadatas['bookableMetadatas']['items'][0]): void {
        meta.bookable = this.bookable();

        if (meta.name) {
            this.bookableMetaService.createOrUpdate(meta).subscribe(created => {
                meta.id = created.id;
                this.alertService.info(`Mis à jour`);
            });

            this.addLine();
        } else if (meta.name === '' && meta.value === '' && meta.id) {
            // If has ID and empty attributes, remove it
            this.delete(meta);
        }
    }

    public delete(meta: BookableMetadatas['bookableMetadatas']['items'][0]): void {
        this.deleting.set(meta, true);

        this.bookableMetaService
            .delete([meta])
            .pipe(finalize(() => this.deleting.delete(meta)))
            .subscribe(() => this.dataSource.remove(meta));
    }
}
