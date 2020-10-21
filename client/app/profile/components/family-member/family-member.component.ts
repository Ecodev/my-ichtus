import {Component, Injector, Input, OnInit} from '@angular/core';
import {
    CreateUser,
    CreateUserVariables,
    UpdateUser,
    UpdateUserVariables,
    User,
    UserVariables,
} from '../../../shared/generated-types';
import {NaturalAbstractDetail} from '@ecodev/natural';
import {merge} from 'lodash-es';
import {FamilyUserService} from './family-user.service';

@Component({
    selector: 'app-family-member',
    templateUrl: './family-member.component.html',
    styleUrls: ['./family-member.component.scss'],
})
export class FamilyMemberComponent
    extends NaturalAbstractDetail<
        User['user'],
        UserVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        never,
        never
    >
    implements OnInit {
    @Input() viewer: User['user'];
    @Input() user: User['user'];
    @Input() readonly = false;
    public loaded = false;

    constructor(private userService: FamilyUserService, injector: Injector) {
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
            this.data = {model: Object.assign(this.service.getConsolidatedForClient(), {owner: this.viewer})};
            this.setForm();
        }
    }

    public setForm() {
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

    public postCreate(model) {
        if (model.login) {
            this.userService.requestPasswordReset(model.login).subscribe(() => {
                this.alertService.info(
                    'Un mail avec les instructions a été envoyé à ' + (model.email || model.owner.email),
                    5000,
                );
            });
        }
    }
}
