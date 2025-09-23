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
import {MatDivider} from '@angular/material/divider';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-license',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatIconButton,
        RouterLink,
        MatIcon,
        NaturalIconDirective,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        MatFormField,
        MatLabel,
        MatError,
        MatInput,
        MatDivider,
        NaturalRelationsComponent,
        NaturalTableButtonComponent,
        NaturalStampComponent,
        NaturalFixedButtonDetailComponent,
    ],
    templateUrl: './license.component.html',
    styleUrl: './license.component.scss',
})
export class LicenseComponent extends NaturalAbstractDetail<LicenseService> {
    public readonly userService = inject(UserService);
    public readonly bookableService = inject(BookableService);

    public constructor() {
        super('license', inject(LicenseService));
    }
}
