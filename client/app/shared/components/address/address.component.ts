import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CountryService} from './country.service';
import {FormGroup} from '@angular/forms';

@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss'],
})
export class AddressComponent {
    @Input() public vertical = false;
    @Input() public form: FormGroup;
    @Output() public change: EventEmitter<boolean> = new EventEmitter();

    constructor(public countryService: CountryService) {}

    public update(): void {
        this.change.emit(true);
    }
}
