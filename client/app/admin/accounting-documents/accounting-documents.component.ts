import {Component, Input, OnInit} from '@angular/core';
import {AccountingDocumentInput, ExpenseClaim, Transaction} from '../../shared/generated-types';
import {forkJoin, Observable} from 'rxjs';
import {AccountingDocumentService} from './services/accounting-document.service';
import {FileModel} from '@ecodev/natural';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'app-accounting-documents',
    templateUrl: './accounting-documents.component.html',
    styleUrls: ['./accounting-documents.component.scss'],
})
export class AccountingDocumentsComponent implements OnInit {
    @Input() public model!: Transaction['transaction'] | ExpenseClaim['expenseClaim'];
    @Input() public fileHeight = 250;
    @Input() public fileWidth = 250;
    @Input() public canRemove = true;

    /**
     * When changing disabled status, add or remove an empty item in list to allow new upload or deny it.
     */
    @Input() set disabled(disabled: boolean) {
        this._disabled = disabled;
        const isLastFileNull = this._files && this._files.length > 0 && this._files[this._files.length - 1] === null;
        if (disabled && isLastFileNull) {
            this._files.pop();
        } else if (!disabled && !isLastFileNull) {
            this._files.push(null); // init empty item to allow upload
        }
    }

    public _files: (FileModel | null)[] = [];
    public _removedFiles: any[] = [];
    public _disabled = false;

    constructor(public readonly accountingDocumentService: AccountingDocumentService) {}

    public ngOnInit(): void {
        if (this.model.accountingDocuments) {
            this._files = this.model.accountingDocuments;
        }

        this.disabled = this._disabled;
    }

    public fileAdded(file: FileModel, index: number): void {
        this._files[index] = file;
        if (index === this._files.length - 1) {
            this._files.push(null);
        }
    }

    public removeFile(index: number): void {
        this._removedFiles = this._removedFiles.concat(this._files.splice(index, 1));
    }

    public trackByFn(index: number, item: FileModel | null): any {
        return index;
    }

    public save(): void {
        const observables: Observable<any>[] = [];

        this._files.forEach(file => {
            if (!file?.file) {
                return;
            }

            const document: AccountingDocumentInput = {file: file.file};
            if (this.model.__typename === 'Transaction') {
                document.transaction = this.model.id;
            } else if (this.model.__typename === 'ExpenseClaim') {
                document.expenseClaim = this.model.id;
            }
            observables.push(this.accountingDocumentService.create(document).pipe(tap(() => delete file.file)));
        });

        this._removedFiles
            .filter(f => f && f.id)
            .forEach(file => {
                observables.push(this.accountingDocumentService.delete([file]));
            });
        this._removedFiles.length = 0;

        forkJoin(observables).subscribe(result => {
            // this.alertService.info('Votre demande a bien été enregistrée');
            // this.router.navigateByUrl('/profile/finances');
        });
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
