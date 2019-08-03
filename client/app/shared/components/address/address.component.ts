import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CountryService } from './country.service';
import { FormGroup } from '@angular/forms';

export const markFormGroupTouched = (formGroup) => {

    (Object as any).values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        if (control.controls) {
            markFormGroupTouched(control);
        }
    });
};

@Component({
    selector: 'app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss'],
})
export class AddressComponent {

    @Input() vertical = false;
    @Input() form: FormGroup;
    @Output() change: EventEmitter<boolean> = new EventEmitter();

    constructor(public countryService: CountryService) {
    }

    public update() {
        this.change.emit(true);
    }

}
