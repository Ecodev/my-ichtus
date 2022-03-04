import {Component, OnInit} from '@angular/core';
import {DoorService} from './services/door.service';
import {Literal, NaturalAbstractController, NaturalAlertService} from '@ecodev/natural';
import {UserService} from '../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {CurrentUserForProfile_viewer} from '../shared/generated-types';

@Component({
    selector: 'app-door',
    templateUrl: './door.component.html',
    styleUrls: ['./door.component.scss'],
})
export class DoorComponent extends NaturalAbstractController implements OnInit {
    public viewer!: CurrentUserForProfile_viewer;

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
