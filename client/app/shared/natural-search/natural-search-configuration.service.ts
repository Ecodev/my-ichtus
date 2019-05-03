import { Injectable } from '@angular/core';
import {
    ItemConfiguration,
    NaturalQueryVariablesManager,
    NaturalSearchConfiguration,
    Selection, TypeNaturalSelectComponent,
    TypeSelectComponent,
} from '@ecodev/natural';
import { UserTagService } from '../../admin/userTags/services/userTag.service';

function wrapLike(s: Selection): Selection {
    if (s.condition.like) {
        s.condition.like.value = '%' + s.condition.like.value + '%';
    }
    return s;
}

/**
 * Replace the operator name (usually "like", "in" or "between") with the
 * attribute "field" or "name" defined in the configuration
 *
 * So:
 *
 *     {field: 'myFieldName', condition: {in: {values: [1, 2, 3]}}}
 *
 * will become
 *
 *     {field: 'myFieldName', condition: {myFieldName: {values: [1, 2, 3]}}}
 */
function replaceOperatorByField(s: Selection, attribute: string = 'field'): Selection {
    const oldOperator = Object.keys(s.condition)[0];

    s.condition[s[attribute]] = s.condition[oldOperator];
    delete s.condition[oldOperator];

    return s;
}

/**
 * Replace the operator name (usually "like", "in" or "between") with the
 * field "name" defined in the configuration
 *
 * So:
 *
 *     {field: 'myFieldName', name:'myConfigName', condition: {in: {values: [1, 2, 3]}}}
 *
 * will become
 *
 *     {field: 'myFieldName',  name:'myConfigName', condition: {myConfigName: {values: [1, 2, 3]}}}
 */
function replaceOperatorByName(s: Selection): Selection {
    return replaceOperatorByField(s, 'name');
}

/**
 * Collection of configuration for natural-search accessible by the object name
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalSearchConfigurationService {

    private readonly userTags: ItemConfiguration = {
        display: 'Tags',
        field: 'userTags',
        component: TypeNaturalSelectComponent,
        configuration: {
            service: this.userTagService,
            placeholder: 'Tags'
        },
    };

    private readonly allConfigurations: { [key: string]: NaturalSearchConfiguration } = {
        users: [
            this.userTags,
        ],
    };

    constructor(public userTagService: UserTagService) {
    }

    /**
     * Returns the natural search configuration for given, or null if non-existent
     */
    public get(key: string): NaturalSearchConfiguration | null {
        return this.allConfigurations[key];
    }

}
