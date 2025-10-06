import {Component, input} from '@angular/core';
import {Bookable} from '../../generated-types';
import {CurrencyPipe} from '@angular/common';

@Component({
    selector: 'app-bookable-price',
    imports: [CurrencyPipe],
    templateUrl: './bookable-price.component.html',
    styleUrl: './bookable-price.component.scss',
})
export class BookablePriceComponent {
    public readonly bookable = input.required<Bookable['bookable']>();
}
