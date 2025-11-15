import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';

@Component({
    selector: 'app-comment',
    imports: [MatDialogModule, MatFormField, MatLabel, MatInput, FormsModule, CdkTextareaAutosize, MatButton],
    templateUrl: './comment.component.html',
    styleUrl: './comment.component.scss',
})
export class CommentComponent {
    protected readonly data = inject(MAT_DIALOG_DATA);

    protected comment = '';
}
