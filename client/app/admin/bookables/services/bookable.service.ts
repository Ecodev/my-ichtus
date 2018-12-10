import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { AbstractModelService, FormValidators } from '../../../shared/services/abstract-model.service';
import { bookableQuery, bookablesQuery, createBookableMutation, deleteBookablesMutation, updateBookableMutation } from './bookable.queries';
import {
    BookableInput,
    BookableQuery,
    BookableQueryVariables,
    BookablesQuery,
    BookablesQueryVariables,
    BookingType,
    CreateBookableMutation,
    CreateBookableMutationVariables,
    DeleteBookablesMutation,
    UpdateBookableMutation,
    UpdateBookableMutationVariables,
} from '../../../shared/generated-types';
import { Validators } from '@angular/forms';
import { BookableResolve } from '../bookable';
import { forkJoin, Observable } from 'rxjs';
import { EnumService } from '../../../shared/services/enum.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class BookableService extends AbstractModelService<BookableQuery['bookable'],
    BookableQueryVariables,
    BookablesQuery['bookables'],
    BookablesQueryVariables,
    CreateBookableMutation['createBookable'],
    CreateBookableMutationVariables,
    UpdateBookableMutation['updateBookable'],
    UpdateBookableMutationVariables,
    DeleteBookablesMutation> {

    constructor(apollo: Apollo, private enumService: EnumService) {
        super(apollo,
            'bookable',
            bookableQuery,
            bookablesQuery,
            createBookableMutation,
            updateBookableMutation,
            deleteBookablesMutation);
    }

    public getEmptyObject(): BookableInput {
        return {
            name: '',
            code: '',
            description: '',
            type: '',
            initialPrice: '',
            periodicPrice: '',
            simultaneousBookingMaximum: -1,
            bookingType: BookingType.admin_only,
        };
    }

    public getFormValidators(): FormValidators {
        return {
            name: [Validators.required, Validators.maxLength(100)],
            code: [Validators.required, Validators.maxLength(100)],
            type: [Validators.required],
        };
    }

    public resolve(id: string): Observable<BookableResolve> {

        // Load enums
        const bookingTypes = this.enumService.get('BookingType');

        const observables = [
            super.resolve(id),
            bookingTypes,
        ];

        return forkJoin(observables).pipe(map((data: any) => {
            return {
                model: data[0].model,
                bookingType: data[1],
            };
        }));
    }

}
