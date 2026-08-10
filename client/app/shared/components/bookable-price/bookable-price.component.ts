import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {type BookableQuery} from '../../generated-types';
import {CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-bookable-price',
    imports: [CurrencyPipe],
    templateUrl: './bookable-price.component.html',
    styleUrl: './bookable-price.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class BookablePriceComponent {
    public readonly bookable = input.required<BookableQuery['bookable']>();
}
