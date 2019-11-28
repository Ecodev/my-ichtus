import {
    Component,
    Output,
    ViewChild,
    EventEmitter,
    OnDestroy,
    Optional,
    Self,
    ElementRef,
    OnInit,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { exampleSetup } from 'prosemirror-example-setup';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { schema } from './schema';

/**
 * Prosemirror component
 * Usage :
 * <prosemirror [(ngModel)]="htmlString"></prosemirror>
 */
@Component({
    selector: 'app-prosemirror',
    template: `
        <div #editor></div>`,
    styleUrls: ['./proseMirror.component.scss'],
})
export class ProsemirrorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private view: EditorView = null;

    @ViewChild('editor', {read: ElementRef, static: true}) editor: ElementRef;

    @Output() contentChange = new EventEmitter<string>();

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    private onChange;

    /**
     * HTML string
     */
    private content = '';

    constructor(
        @Optional() @Self() public ngControl: NgControl,
    ) {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnInit(): void {
        const serializer = DOMSerializer.fromSchema(schema);
        const state = this.createState();

        this.view = new EditorView(this.editor.nativeElement, {
            state: state,

            dispatchTransaction: transaction => {
                const newState = this.view.state.apply(transaction);
                this.view.updateState(newState);

                // Transform doc into HTML string
                const dom = serializer.serializeFragment(this.view.state.doc);
                const el = document.createElement('_');
                el.appendChild(dom);

                const newContent = el.innerHTML;
                if (this.content === newContent) {
                    return;
                }

                this.content = el.innerHTML;

                if (this.onChange) {
                    this.onChange(this.content);
                }
                this.contentChange.emit(this.content);
            },
        });
    }

    public writeValue(val: string | undefined): void {

        if (typeof val === 'string' && this.view !== null && val !== this.content) {
            this.content = val;
            const state = this.createState();
            this.view.updateState(state);
        }
    }

    private createState() {
        const template = document.createElement('_');
        template.innerHTML = '<div>' + this.content + '</div>';

        const parser = DOMParser.fromSchema(schema);
        const doc = parser.parse(template.firstChild);

        return EditorState.create({
            doc: doc,
            plugins: exampleSetup({schema}),
        });
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
    }

    public setDisabledState(isDisabled: boolean): void {
        // TODO disable editor ?
    }

    public ngOnDestroy(): void {
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    }
}
