import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CountryService} from './country.service';
import {UntypedFormGroup} from '@angular/forms';

@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss'],
})
export class AddressComponent {
    @Input() public vertical = false;
    @Input({required: true}) public form!: UntypedFormGroup;
    @Output() public readonly addressChange = new EventEmitter<void>();

    public constructor(public readonly countryService: CountryService) {}

    public update(): void {
        this.addressChange.emit();
    }
}
