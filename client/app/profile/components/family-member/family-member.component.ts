import {Component, inject, input, OnInit, output} from '@angular/core';
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
import {MatCheckbox} from '@angular/material/checkbox';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {AddressComponent} from '../../../shared/components/address/address.component';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltip} from '@angular/material/tooltip';

/**
 * All users that were requested to be deleted during this session.
 * We specifically never clear the map, unless in case of XHR error,
 * because we want to prevent email spamming.
 */
const userDeletionRequested = new Map<string, void>();

@Component({
    selector: 'app-family-member',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        AddressComponent,
        MatButton,
        MatCheckbox,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDivider,
        MatError,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        MatPrefix,
        MatSuffix,
        MatTooltip,
        NaturalFixedButtonComponent,
        NaturalIconDirective,
        NaturalSelectEnumComponent,
    ],
    templateUrl: './family-member.component.html',
    styleUrl: './family-member.component.scss',
})
export class FamilyMemberComponent extends NaturalAbstractDetail<FamilyUserService> implements OnInit {
    public readonly viewer = input.required<NonNullable<CurrentUserForProfile['viewer']>>();
    public readonly user = input.required<Users['users']['items'][0]>();
    public readonly readonly = input(false);
    public readonly created = output();
    public readonly removed = output();
    public readonly updated = output<UpdateUser['updateUser']>();
    public loaded = false;
    public readonly userDeletionRequested = userDeletionRequested;

    public constructor() {
        super('user', inject(FamilyUserService));
    }

    /**
     * Replace resolved data from router by input and server query
     */
    public override ngOnInit(): void {
        const userValue = this.user();
        if (userValue?.id) {
            this.service.getOne(userValue.id).subscribe(user => {
                this.data = merge(
                    {model: this.service.getDefaultForServer()},
                    merge({model: user}, {owner: this.viewer()}),
                );
                this.setForm();
            });
        } else {
            this.data = {
                model: Object.assign(this.service.getDefaultForServer(), {
                    owner: this.viewer(),
                    status: this.viewer().status,
                }),
            };
            this.setForm();
        }
    }

    private setForm(): void {
        this.initForm();
        if (this.readonly()) {
            this.form.disable();
        }
        const familyRelationship = this.form.get('familyRelationship');
        if (familyRelationship && this.viewer().owner) {
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
            .confirm(`Détacher ${this.user().name} du ménage`, explanation, 'Détacher du ménage')
            .subscribe(confirmed => {
                if (confirmed) {
                    this.service.leaveFamily(this.user()).subscribe(() => {
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

    public requestUserDeletion(): void {
        if (!this.isUpdatePage()) {
            return;
        }

        const explanation = `Une personne du club prendra contact avec toi pour coordonner la suppression définitive du compte "${this.data.model.name}", et le remboursement du solde le cas échéant. Après quoi, tu perderas tout accès au club et tes données personnelles seront supprimée définitivement.`;
        this.alertService
            .confirm(
                `Suppression définitive du compte "${this.data.model.name}"`,
                explanation,
                `Demander la suppression définitive`,
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    const user = this.user();
                    this.userDeletionRequested.set(user.id);
                    this.service.requestUserDeletion(user.id).subscribe({
                        next: () => {
                            const message = `Demande envoyée`;
                            this.alertService.info(message, 5000);
                        },
                        error: () => this.userDeletionRequested.delete(this.user().id),
                    });
                }
            });
    }
}
