import {Directive, Injectable, Input} from '@angular/core';
import {
    LinkableObject,
    Literal,
    NaturalAbstractList,
    NaturalAbstractModelService,
    VariablesWithInput,
} from '@ecodev/natural';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractBookings<
    TService extends NaturalAbstractModelService<
        any,
        {id: string},
        any,
        any,
        LinkableObject,
        VariablesWithInput,
        any,
        {id: string; input: Literal},
        any,
        {ids: string[]}
    >
> extends NaturalAbstractList<TService> {
    @Input() public availableColumns?: string[];

    public columnIsAvailable(column: string): boolean {
        if (this.availableColumns === undefined) {
            return true;
        }

        return this.availableColumns.includes(column);
    }

    protected initFromRoute(): void {
        // Available columns
        if (this.route.snapshot.data.availableColumns) {
            this.availableColumns = this.route.snapshot.data.availableColumns;
        }
        super.initFromRoute();
    }
}
