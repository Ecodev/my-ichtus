import {Component, inject, Input, output} from '@angular/core';
import {CountryService} from './country.service';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalSelectComponent} from '@ecodev/natural';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-address',
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NaturalSelectComponent],
    templateUrl: './address.component.html',
    styleUrl: './address.component.scss',
})
export class AddressComponent {
    public readonly countryService = inject(CountryService);

    @Input() public vertical = false;
    @Input({required: true}) public form!: FormGroup;
    public readonly addressChange = output();

    public update(): void {
        this.addressChange.emit();
    }
}
