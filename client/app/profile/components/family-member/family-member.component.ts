import {Component, Injector, Input, OnInit} from '@angular/core';
import {
    CreateUser_createUser,
    CurrentUserForProfile_viewer,
    User,
    Users_users_items,
} from '../../../shared/generated-types';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {merge} from 'lodash-es';
import {FamilyUserService} from './family-user.service';
import {EMPTY, Observable} from 'rxjs';

@Component({
    selector: 'app-family-member',
    templateUrl: './family-member.component.html',
    styleUrls: ['./family-member.component.scss'],
})
export class FamilyMemberComponent extends NaturalAbstractDetail<FamilyUserService> implements OnInit {
    @Input() public viewer!: CurrentUserForProfile_viewer;
    @Input() public user!: User['user'] | Users_users_items;
    @Input() public readonly = false;
    public loaded = false;

    constructor(private readonly userService: FamilyUserService, injector: Injector) {
        super('user', userService, injector);
    }

    /**
     * Replace resolved data from router by input and server query
     */
    public ngOnInit(): void {
        if (this.user && this.user.id) {
            this.service.getOne(this.user.id).subscribe(user => {
                this.data = merge(
                    {model: this.service.getConsolidatedForClient()},
                    {model: user},
                    {owner: this.viewer},
                );
                this.setForm();
            });
        } else {
            this.data = {
                model: Object.assign(this.service.getConsolidatedForClient(), {
                    owner: this.viewer,
                    status: this.viewer.status,
                }),
            };
            this.setForm();
        }
    }

    public setForm(): void {
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

    protected postCreate(model: CreateUser_createUser): Observable<unknown> {
        if (model.login) {
            this.userService.requestPasswordReset(model.login).subscribe(() => {
                this.alertService.info(
                    'Un mail avec les instructions a été envoyé à ' + (model.email || model.owner?.email),
                    5000,
                );
            });
        }

        return EMPTY;
    }
}
