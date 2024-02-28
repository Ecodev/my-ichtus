import {Component, OnInit} from '@angular/core';
import {DoorService} from './services/door.service';
import {Literal, NaturalAbstractController, NaturalAlertService} from '@ecodev/natural';
import {UserService} from '../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {CurrentUserForProfile} from '../shared/generated-types';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CardComponent} from '../shared/components/card/card.component';

import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-door',
    templateUrl: './door.component.html',
    styleUrls: ['./door.component.scss'],
    standalone: true,
    imports: [FlexModule, CardComponent, MatButtonModule, MatIconModule],
})
export class DoorComponent extends NaturalAbstractController implements OnInit {
    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public constructor(
        public readonly doorService: DoorService,
        private readonly userService: UserService,
        private readonly alertService: NaturalAlertService,
        private readonly route: ActivatedRoute,
    ) {
        super();
    }

    public open(door: Literal): void {
        this.doorService.open({door: door.id}).subscribe({
            next: res => {
                door.opened = true;
                this.alertService.info(res.message);
                setTimeout(() => (door.opened = false), res.timer * 1000);
            },
            error: err => {
                this.alertService.error(err.message, 5000);
            },
        });
    }

    public ngOnInit(): void {
        this.viewer = this.route.snapshot.data.viewer.model;
    }
}
