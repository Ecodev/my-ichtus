import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';

/**
 * Format a number with `'` and `.` as thousand separators and decimal
 *
 * Eg: `"12'3456.78"`
 */
function formatNumber(value: number): string {
    const numberFormat = new Intl.NumberFormat('fr-CH', {useGrouping: true});

    const parts = numberFormat.formatToParts(value);
    const fixedParts = parts.map(v => {
        if (v.type === 'group') {
            return "'";
        } else if (v.type === 'decimal') {
            return '.';
        } else {
            return v.value;
        }
    });

    return fixedParts.join('');
}

@Injectable({
    providedIn: 'root',
})
export class LocalizedPaginatorIntlService extends MatPaginatorIntl {
    public constructor() {
        super();

        this.itemsPerPageLabel = 'Par page :';
        this.itemsPerPageLabel = this.itemsPerPageLabel.replace(':', '').trim();
        this.nextPageLabel = 'Suivant';
        this.previousPageLabel = 'Précédent';

        this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
            if (length === 0 || pageSize === 0) {
                return `0/${formatNumber(length)}`;
            }

            length = Math.max(length, 0);

            const startIndex = page * pageSize;

            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

            return `${formatNumber(startIndex + 1)}-${formatNumber(endIndex)}/${formatNumber(length)}`;
        };
    }
}
