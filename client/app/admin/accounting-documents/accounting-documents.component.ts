import {Component, Input, OnInit} from '@angular/core';
import {AccountingDocumentInput, ExpenseClaim, Transaction} from '../../shared/generated-types';
import {forkJoin, Observable} from 'rxjs';
import {AccountingDocumentService} from './services/accounting-document.service';
import {FileModel, WithId, NaturalFileComponent, NaturalIconDirective} from '@ecodev/natural';
import {tap} from 'rxjs/operators';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NgFor, NgIf} from '@angular/common';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-accounting-documents',
    templateUrl: './accounting-documents.component.html',
    styleUrls: ['./accounting-documents.component.scss'],
    standalone: true,
    imports: [FlexModule, NgFor, NaturalFileComponent, NgIf, MatButtonModule, MatIconModule, NaturalIconDirective],
})
export class AccountingDocumentsComponent implements OnInit {
    @Input({required: true}) public model!: Transaction['transaction'] | ExpenseClaim['expenseClaim'];
    @Input() public fileHeight = 250;
    @Input() public fileWidth = 250;
    @Input() public canRemove = true;

    /**
     * When changing disabled status, add or remove an empty item in list to allow new upload or deny it.
     */
    @Input()
    public set disabled(disabled: boolean) {
        this._disabled = disabled;
        const isLastFileNull = this.files && this.files.length > 0 && this.files[this.files.length - 1] === null;
        if (disabled && isLastFileNull) {
            this.files.pop();
        } else if (!disabled && !isLastFileNull) {
            this.files.push(null); // init empty item to allow upload
        }
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    public files: (FileModel | null)[] = [];
    private readonly removedFiles: WithId<FileModel>[] = [];
    private _disabled = false;

    public constructor(public readonly accountingDocumentService: AccountingDocumentService) {}

    public ngOnInit(): void {
        if (this.model.accountingDocuments) {
            this.files = this.model.accountingDocuments;
        }

        this.disabled = this._disabled;
    }

    public fileAdded(file: FileModel, index: number): void {
        this.files[index] = file;
        if (index === this.files.length - 1) {
            this.files.push(null);
        }
    }

    public removeFile(index: number): void {
        this.files.splice(index, 1).forEach(file => {
            if (file && file.id) {
                this.removedFiles.push(file as WithId<FileModel>);
            }
        });
    }

    public trackByFn(index: number): number {
        return index;
    }

    public save(): void {
        const observables: Observable<unknown>[] = [];

        this.files.forEach(file => {
            if (!file?.file) {
                return;
            }

            const document: AccountingDocumentInput = {file: file.file};
            if (this.model.__typename === 'Transaction') {
                document.transaction = this.model.id;
            } else if (this.model.__typename === 'ExpenseClaim') {
                document.expenseClaim = this.model.id;
            }
            observables.push(
                this.accountingDocumentService.create(document).pipe(
                    tap(newFile => {
                        delete file.file;
                        file.id = newFile.id;
                        file.mime = newFile.mime;
                        file.__typename = newFile.__typename;
                    }),
                ),
            );
        });

        if (this.removedFiles.length) {
            observables.push(this.accountingDocumentService.delete(this.removedFiles));
            this.removedFiles.length = 0;
        }

        forkJoin(observables).subscribe();
    }

    public getAction(file: FileModel | null, i: number, last: boolean): 'download' | 'upload' | null {
        if (file && file.id) {
            return 'download'; // if there is non null file, and it has ID, it's downloadable
        } else if ((!file || !file.id) && last && !this._disabled) {
            return 'upload'; // If cmp is not readonly and file is last of list (null item), allow upload
        }

        // Other cases : there is uploaded file, but without ID for now, it no more uploadable, and not downloadable either
        return null;
    }
}
