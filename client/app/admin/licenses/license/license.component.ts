import {Component, inject} from '@angular/core';
import {
    NaturalAbstractDetail,
    NaturalFixedButtonDetailComponent,
    NaturalIconDirective,
    NaturalLinkableTabDirective,
    NaturalRelationsComponent,
    NaturalStampComponent,
    NaturalTableButtonComponent,
} from '@ecodev/natural';
import {LicenseService} from '../services/license.service';
import {BookableService} from '../../bookables/services/bookable.service';
import {UserService} from '../../users/services/user.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrl: './license.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NaturalIconDirective,
        MatTabsModule,
        NaturalLinkableTabDirective,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
})
export class LicenseComponent extends NaturalAbstractDetail<LicenseService> {
    public readonly userService = inject(UserService);
    public readonly bookableService = inject(BookableService);

    public constructor() {
        super('license', inject(LicenseService));
    }
}
