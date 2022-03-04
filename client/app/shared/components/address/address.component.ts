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
    @Input() public form!: FormGroup;
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change = new EventEmitter<void>();

    public constructor(public readonly countryService: CountryService) {}

    public update(): void {
        this.change.emit();
    }
}
