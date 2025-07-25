import {Component, inject, Input, OnInit, output} from '@angular/core';
import {CreateUser, CurrentUserForProfile, UpdateUser, Users} from '../../../shared/generated-types';
import {
    NaturalAbstractDetail,
    NaturalFixedButtonComponent,
    NaturalIconDirective,
    NaturalSelectEnumComponent,
} from '@ecodev/natural';
import {merge} from 'es-toolkit';
import {FamilyUserService} from './family-user.service';
import {EMPTY, Observable} from 'rxjs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {AddressComponent} from '../../../shared/components/address/address.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-family-member',
    templateUrl: './family-member.component.html',
    styleUrl: './family-member.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NaturalSelectEnumComponent,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        AddressComponent,
        MatDatepickerModule,
        MatCheckboxModule,
        NaturalFixedButtonComponent,
    ],
})
export class FamilyMemberComponent extends NaturalAbstractDetail<FamilyUserService> implements OnInit {
    @Input({required: true}) public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    @Input({required: true}) public user!: Users['users']['items'][0];
    @Input() public readonly = false;
    public readonly created = output();
    public readonly removed = output();
    public readonly updated = output<UpdateUser['updateUser']>();
    public loaded = false;

    public constructor() {
        super('user', inject(FamilyUserService));
    }

    /**
     * Replace resolved data from router by input and server query
     */
    public override ngOnInit(): void {
        if (this.user?.id) {
            this.service.getOne(this.user.id).subscribe(user => {
                this.data = merge(
                    {model: this.service.getDefaultForServer()},
                    merge({model: user}, {owner: this.viewer}),
                );
                this.setForm();
            });
        } else {
            this.data = {
                model: Object.assign(this.service.getDefaultForServer(), {
                    owner: this.viewer,
                    status: this.viewer.status,
                }),
            };
            this.setForm();
        }
    }

    private setForm(): void {
        this.initForm();
        if (this.readonly) {
            this.form.disable();
        }
        const familyRelationship = this.form.get('familyRelationship');
        if (familyRelationship && this.viewer.owner) {
            familyRelationship.disable();
        }

        this.loaded = true;
    }

    protected override postCreate(model: CreateUser['createUser']): Observable<unknown> {
        if (model.login) {
            this.service.requestPasswordReset(model.login).subscribe(() => {
                this.alertService.info(
                    'Un mail avec les instructions a été envoyé à ' + (model.email || model.owner?.email),
                    5000,
                );
            });
        }
        this.created.emit();

        return EMPTY;
    }

    public leaveFamily(): void {
        const explanation = `En détachant du ménage cette personne, elle perdra les privilèges associés au ménage.
        Elle lui faudra alors faire une demande d'adhésion en tant que membre individuel pour retrouver ces privilèges.`;
        this.alertService
            .confirm(`Détacher ${this.user.name} du ménage`, explanation, 'Détacher du ménage')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.service.leaveFamily(this.user).subscribe(() => {
                        this.removed.emit();
                        const message = 'La personne a été détachée du ménage';
                        this.alertService.info(message, 5000);
                    });
                }
            });
    }

    protected override postUpdate(model: UpdateUser['updateUser']): void {
        this.updated.emit(model);
    }
}
