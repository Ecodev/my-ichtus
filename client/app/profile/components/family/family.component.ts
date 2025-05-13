import {ChangeDetectorRef, Component, inject, OnInit, viewChildren} from '@angular/core';
import {CurrentUserForProfile, UpdateUser, Users, UsersVariables} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NaturalAlertService, NaturalFixedButtonComponent, NaturalQueryVariablesManager} from '@ecodev/natural';
import {cloneDeep} from 'lodash-es';
import {MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';
import {first, skip} from 'rxjs/operators';
import {FamilyMemberComponent} from '../family-member/family-member.component';
import {MatButtonModule} from '@angular/material/button';
import {AsyncPipe} from '@angular/common';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-family',
    templateUrl: './family.component.html',
    styleUrl: './family.component.scss',
    imports: [
        MatButtonModule,
        RouterLink,
        MatExpansionModule,
        FamilyMemberComponent,
        NaturalFixedButtonComponent,
        AsyncPipe,
    ],
})
export class FamilyComponent implements OnInit {
    public readonly userService = inject(UserService);
    private readonly route = inject(ActivatedRoute);
    private readonly alertService = inject(NaturalAlertService);
    public readonly permissionsService = inject(PermissionsService);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;
    public familyMembers: Users['users']['items'][0][] = [];

    /**
     * Member selected when opening an accordion panel
     */
    public activeMember: Users['users']['items'][0] | null = null;

    private readonly expansionPanels = viewChildren(MatExpansionPanel);
    private readonly expansionPanels$ = toObservable(this.expansionPanels);

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer;
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
        this.expansionPanels$.pipe(skip(1), first()).subscribe(panels => {
            panels[panels.length - 1].open();
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
                    this.viewer = user;
                    const message = 'Tu as quitté le ménage';
                    this.alertService.info(message, 5000);
                });
            }
        });
    }
}
