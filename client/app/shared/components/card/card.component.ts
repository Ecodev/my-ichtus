import {Component, Input, OnInit} from '@angular/core';
import {FileModel, NaturalFileComponent} from '@ecodev/natural';
import {MatCardModule} from '@angular/material/card';

@Component({
    selector: 'app-card',
    imports: [MatCardModule, NaturalFileComponent],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
    @Input() public illustrationHeight = 200;
    @Input() public file: FileModel | null = null;
    @Input() public illustrationUrl = '';

    public ngOnInit(): void {
        if (!this.file && this.illustrationUrl) {
            this.file = {src: this.illustrationUrl};
        }
    }
}
