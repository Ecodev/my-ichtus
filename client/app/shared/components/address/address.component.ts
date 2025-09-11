import {Component, inject, output, input} from '@angular/core';
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

    public readonly vertical = input(false);
    public readonly form = input.required<FormGroup>();
    public readonly addressChange = output();

    public update(): void {
        this.addressChange.emit();
    }
}
