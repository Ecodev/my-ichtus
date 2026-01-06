import {NaturalErrorMessagePipe, NaturalSelectComponent} from '@ecodev/natural';
import {Component, inject, input, output} from '@angular/core';
import {CountryService} from './country.service';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';

@Component({
    selector: 'app-address',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatInput,
        NaturalSelectComponent,
    ],
    templateUrl: './address.component.html',
    styleUrl: './address.component.scss',
})
export class AddressComponent {
    protected readonly countryService = inject(CountryService);

    public readonly vertical = input(false);
    public readonly form = input.required<FormGroup>();
    protected readonly addressChange = output();

    protected update(): void {
        this.addressChange.emit();
    }
}
