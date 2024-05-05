import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CountryService} from './country.service';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalSelectComponent} from '@ecodev/natural';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrl: './address.component.scss',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NaturalSelectComponent],
})
export class AddressComponent {
    @Input() public vertical = false;
    @Input({required: true}) public form!: FormGroup;
    @Output() public readonly addressChange = new EventEmitter<void>();

    public constructor(public readonly countryService: CountryService) {}

    public update(): void {
        this.addressChange.emit();
    }
}
