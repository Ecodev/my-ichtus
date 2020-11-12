import {Component, Input, OnInit} from '@angular/core';
import {BookableMetadataService} from './bookable-metadata.service';
import {NaturalDataSource, NaturalQueryVariablesManager} from '@ecodev/natural';
import {
    BookableMetadatas_bookableMetadatas_items,
    BookableMetadatasVariables,
    BookableMetadatas_bookableMetadatas,
} from '../../shared/generated-types';
import {cloneDeep} from 'lodash-es';

@Component({
    selector: 'app-bookable-metadata',
    templateUrl: './bookable-metadata.component.html',
    styleUrls: ['./bookable-metadata.component.scss'],
})
export class BookableMetadataComponent implements OnInit {
    @Input() public bookable;
    @Input() public edit = false;

    public dataSource: NaturalDataSource<BookableMetadatas_bookableMetadatas>;

    public columns;

    constructor(private bookableMetaService: BookableMetadataService) {}

    public ngOnInit(): void {
        if (this.edit) {
            this.columns = ['name', 'value', 'delete'];
        } else {
            this.columns = ['name', 'value'];
        }

        if (this.bookable) {
            const variables: BookableMetadatasVariables = {
                filter: {groups: [{conditions: [{bookable: {equal: {value: this.bookable.id}}}]}]},
            };

            const qvm = new NaturalQueryVariablesManager<BookableMetadatasVariables>();
            qvm.set('variables', variables);

            // TODO : replace by watchAll because two admins may work on same object and meta data could change between two visits
            this.bookableMetaService.getAll(qvm).subscribe(bookables => {
                this.dataSource = new NaturalDataSource<BookableMetadatas_bookableMetadatas>(cloneDeep(bookables));
                this.addLine();
            });
        } else {
            this.addLine();
        }
    }

    /**
     * Add line if edit mode is true and last item is not already empty
     */
    public addLine() {
        if (this.edit && this.dataSource.data) {
            const lastItem = this.dataSource.data.items[this.dataSource.data.items.length - 1];
            if (!lastItem || lastItem.name !== '' || lastItem.value !== '') {
                this.dataSource.push(
                    this.bookableMetaService.getConsolidatedForClient() as BookableMetadatas_bookableMetadatas_items,
                );
            }
        }
    }

    public updateOrCreate(meta) {
        meta.bookable = this.bookable.id;

        if (meta.name) {
            this.bookableMetaService.createOrUpdate(meta).subscribe();

            this.addLine();
        } else if (meta.name === '' && meta.value === '' && meta.id) {
            // If has ID and empty attributes, remove it
            this.delete(meta);
        }
    }

    public delete(meta) {
        this.bookableMetaService.delete([meta]).subscribe(() => {
            this.dataSource.remove(meta);
        });
    }
}
