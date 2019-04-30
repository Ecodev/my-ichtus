import { Component, Input, OnInit } from '@angular/core';
import { CreateUser, CreateUserVariables, UpdateUser, UpdateUserVariables, User, UserVariables } from '../../../shared/generated-types';
import { NaturalAlertService } from '@ecodev/natural';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'lodash';
import { FamilyUserService } from './family-user.service';
import { NaturalAbstractDetail } from '@ecodev/natural';

@Component({
    selector: 'app-family-member',
    templateUrl: './family-member.component.html',
    styleUrls: ['./family-member.component.scss'],
})
export class FamilyMemberComponent
    extends NaturalAbstractDetail<User['user'],
        UserVariables,
        CreateUser['createUser'],
        CreateUserVariables,
        UpdateUser['updateUser'],
        UpdateUserVariables,
        any> implements OnInit {

    @Input() viewer: User['user'];
    @Input() user: User['user'];
    @Input() readonly = false;

    constructor(alertService: NaturalAlertService,
                private userService: FamilyUserService,
                router: Router,
                route: ActivatedRoute,
    ) {
        super('user', userService, alertService, router, route);
    }

    /**
     * Replace resolved data from router by input and server query
     */
    ngOnInit() {

        if (this.user && this.user.id) {
            this.service.getOne(this.user.id).subscribe(user => {
                this.data = merge({model: this.service.getConsolidatedForClient()}, {model: user}, {owner: this.viewer});
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

    }

    public postCreate(model) {
        if (model.login) {
            this.userService.requestPasswordReset(model.login).subscribe(() => {
                this.alertService.info('Un mail avec les instructions a été envoyé à ' + (model.email || model.owner.email), 5000);
            });
        }

    }

}
