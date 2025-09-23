import {Component, Input, input, OnInit} from '@angular/core';
import {FileModel, NaturalFileComponent} from '@ecodev/natural';
import {MatCard} from '@angular/material/card';

@Component({
    selector: 'app-card',
    imports: [MatCard, NaturalFileComponent],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
    public readonly illustrationHeight = input(200);
    @Input() public file: FileModel | null = null;
    public readonly illustrationUrl = input('');

    public ngOnInit(): void {
        const illustrationUrl = this.illustrationUrl();
        if (!this.file && illustrationUrl) {
            this.file = {src: illustrationUrl};
        }
    }
}
