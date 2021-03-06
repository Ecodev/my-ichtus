import {Component, Input, OnInit} from '@angular/core';
import {FileModel} from '@ecodev/natural';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
    @Input() public illustrationHeight = 200;
    @Input() public file: FileModel | null = null;
    @Input() public illustrationUrl = '';

    constructor() {}

    public ngOnInit(): void {
        if (!this.file && this.illustrationUrl) {
            this.file = {src: this.illustrationUrl};
        }
    }
}
