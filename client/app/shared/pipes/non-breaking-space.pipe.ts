import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'nbsp',
    standalone: true, // Enlever si Angular < 14
})
export class NonBreakingSpacePipe implements PipeTransform {
    public transform(value: string | null | undefined): string {
        if (!value) {
            return '';
        }

        return value.replace(/ /g, '\u00A0');
    }
}
