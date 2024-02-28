import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {UpdateUser, UsersVariables} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {
    mergeOverrideArray,
    NaturalAlertService,
    NaturalQueryVariablesManager,
    NaturalFixedButtonComponent,
} from '@ecodev/natural';
import {cloneDeep, mergeWith} from 'lodash-es';
import {MatExpansionPanel, MatExpansionModule} from '@angular/material/expansion';
import {first} from 'rxjs/operators';
import {CurrentUserForProfile, Users} from '../../../shared/generated-types';
import {FamilyMemberComponent} from '../family-member/family-member.component';

import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-family',
    templateUrl: './family.component.html',
    styleUrls: ['./family.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        MatButtonModule,
        RouterLink,
        MatExpansionModule,
        FamilyMemberComponent,
        NaturalFixedButtonComponent,
    ],
})
export class FamilyComponent implements OnInit {
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public familyMembers: Users['users']['items'][0][] = [];

    /**
     * Member selected when opening an accordion panel
     */
    public activeMember: Users['users']['items'][0] | null = null;
    @ViewChildren(MatExpansionPanel) private readonly expansionPanels!: QueryList<MatExpansionPanel>;

    public constructor(
        public readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly alertService: NaturalAlertService,
        public readonly permissionsService: PermissionsService,
        private readonly changeDetectorRef: ChangeDetectorRef,
    ) {}

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;
        this.reload();
    }

    public reload(): void {
        if (this.viewer) {
            const qvm = new NaturalQueryVariablesManager<UsersVariables>();
            qvm.set('variables', UserService.getFamilyVariables(this.viewer));
            this.userService.getAll(qvm).subscribe(family => (this.familyMembers = cloneDeep(family.items)));
            this.activeMember = null;
        }
    }

    public refreshMember(index: number, user: UpdateUser['updateUser']): void {
        this.familyMembers[index].name = user.name;
    }

    public add(): void {
        this.expansionPanels.changes.pipe(first()).subscribe(panels => {
            panels.last.open();
            this.changeDetectorRef.detectChanges();
        });

        const emptyUser = this.userService.getDefaultForServer() as Users['users']['items'][0];
        this.familyMembers.push(emptyUser);
    }

    /**
     * This kinda duplicates server ACL. But we prefer to keep it, so even if the viewer is allowed by server to update
     * any user, via /admin/user, we can still prevent him to do it on this page. This avoids the confusion of
     * "why the daughter can update the entire family, but the son cannot ?", when in fact the daughter has a higher
     * role than the son.
     */
    public canEdit(familyMember?: Users['users']['items'][0]): boolean {
        const iAmFamilyOwner = !this.viewer.owner;
        const isMyself = !!familyMember && familyMember.id === this.viewer.id;

        return iAmFamilyOwner || isMyself;
    }

    public leaveFamily(): void {
        const explanation = `En quittant le ménage tu perdras les privilèges associés au ménage.
        Il te faudra alors faire une demande d'adhésion en tant que membre individuel pour retrouver ces privilèges.`;
        this.alertService.confirm('Quitter le ménage', explanation, 'Quitter le ménage').subscribe(confirmed => {
            if (confirmed) {
                this.userService.leaveFamily(this.viewer).subscribe(user => {
                    mergeWith(this.viewer, user, mergeOverrideArray);
                    const message = 'Tu as quitté le ménage';
                    this.alertService.info(message, 5000);
                });
            }
        });
    }
}
