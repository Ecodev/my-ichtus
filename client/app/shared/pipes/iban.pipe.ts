import {Pipe, PipeTransform} from '@angular/core';
import {friendlyFormatIBAN} from 'ibantools';

@Pipe({
    name: 'iban',
    standalone: true,
})
export class IbanPipe implements PipeTransform {
    public transform(value: string): string | null {
        return friendlyFormatIBAN(value);
    }
}
