import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CountryService} from './country.service';
import {FormGroup} from '@angular/forms';

@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss'],
})
export class AddressComponent {
    @Input() vertical = false;
    @Input() form: FormGroup;
    @Output() change: EventEmitter<boolean> = new EventEmitter();

    constructor(public countryService: CountryService) {}

    public update() {
        this.change.emit(true);
    }
}
