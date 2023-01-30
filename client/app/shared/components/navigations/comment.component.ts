import {Component, Inject} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
    public comment = '';

    public constructor(@Inject(MAT_DIALOG_DATA) public readonly data: any) {}
}
