import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {UsersVariables} from '../../../shared/generated-types';
import {UserService} from '../../../admin/users/services/user.service';
import {PermissionsService} from '../../../shared/services/permissions.service';
import {ActivatedRoute} from '@angular/router';
import {mergeOverrideArray, NaturalAlertService, NaturalQueryVariablesManager} from '@ecodev/natural';
import {mergeWith} from 'lodash-es';
import {MatExpansionPanel} from '@angular/material/expansion';
import {first} from 'rxjs/operators';
import {Users_users_items} from '../../../shared/generated-types';

@Component({
    selector: 'app-family',
    templateUrl: './family.component.html',
    styleUrls: ['./family.component.scss'],
})
export class FamilyComponent implements OnInit {
    public viewer;
    public familyMembers: Users_users_items[] = [];

    @ViewChildren(MatExpansionPanel) private readonly expansionPanels: QueryList<MatExpansionPanel>;

    constructor(
        public userService: UserService,
        private route: ActivatedRoute,
        private alertService: NaturalAlertService,
        public permissionsService: PermissionsService,
        private readonly changeDetectorRef: ChangeDetectorRef,
    ) {}

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;

        if (this.viewer) {
            const qvm = new NaturalQueryVariablesManager<UsersVariables>();
            qvm.set('variables', UserService.getFamilyVariables(this.viewer));
            this.userService.getAll(qvm).subscribe(members => (this.familyMembers = [...members.items]));
        }
    }

    public add() {
        this.expansionPanels.changes.pipe(first()).subscribe(panels => {
            panels.last.open();
            this.changeDetectorRef.detectChanges();
        });

        const emptyUser = this.userService.getConsolidatedForClient() as Users_users_items;
        this.familyMembers.push(emptyUser);
    }

    public canEdit(familyMember) {
        return !this.viewer.owner || this.viewer.id === familyMember.id;
    }

    public leaveFamily(): void {
        const explanation = `En quittant le ménage vous perdrez les privilèges associés au ménage.
        Il vous faudra alors faire une demande d'adhésion en tant que membre indépendant pour retrouver ces privilièges.`;
        this.alertService.confirm('Quitter le ménage', explanation, 'Quitter le ménage').subscribe(confirmed => {
            if (confirmed) {
                this.userService.leaveFamily(this.viewer).subscribe(user => {
                    mergeWith(this.viewer, user, mergeOverrideArray);
                    const message = 'Vous avez quitté le ménage';
                    this.alertService.info(message, 5000);
                });
            }
        });
    }
}
