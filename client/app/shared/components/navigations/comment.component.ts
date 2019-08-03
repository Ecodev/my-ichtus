import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],

})
export class CommentComponent {

    public comment: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }
}
