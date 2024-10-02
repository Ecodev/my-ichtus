import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {TextFieldModule} from '@angular/cdk/text-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrl: './comment.component.scss',
    standalone: true,
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, TextFieldModule, MatButtonModule],
})
export class CommentComponent {
    public readonly data = inject(MAT_DIALOG_DATA);

    public comment = '';
}
