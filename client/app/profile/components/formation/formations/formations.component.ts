import {Component} from '@angular/core';
import {UsageBookablesComponent} from '../../../../admin/bookables/bookables/usage-bookables.component';
import {NaturalSearchComponent} from '@ecodev/natural';
import {MatPaginator} from '@angular/material/paginator';
import {FlagComponent} from '../../../../shared/components/flag/flag.component';
import {NgTemplateOutlet} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {UserContactDataComponent} from '../../../../shared/components/user-contact-data/user-contact-data.component';
import {BookablePriceComponent} from '../../../../shared/components/bookable-price/bookable-price.component';

@Component({
    selector: 'app-formations',
    imports: [
        NaturalSearchComponent,
        MatPaginator,
        FlagComponent,
        NgTemplateOutlet,
        MatButton,
        UserContactDataComponent,
        BookablePriceComponent,
    ],
    templateUrl: './formations.component.html',
    styleUrl: './formations.component.scss',
})
export class FormationsComponent extends UsageBookablesComponent {}
