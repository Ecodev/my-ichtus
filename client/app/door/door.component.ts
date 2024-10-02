import {Component, OnInit, inject} from '@angular/core';
import {DoorService} from './services/door.service';
import {Literal, NaturalAlertService} from '@ecodev/natural';
import {UserService} from '../admin/users/services/user.service';
import {ActivatedRoute} from '@angular/router';
import {CurrentUserForProfile} from '../shared/generated-types';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CardComponent} from '../shared/components/card/card.component';

@Component({
    selector: 'app-door',
    templateUrl: './door.component.html',
    styleUrl: './door.component.scss',
    standalone: true,
    imports: [CardComponent, MatButtonModule, MatIconModule],
})
export class DoorComponent implements OnInit {
    public readonly doorService = inject(DoorService);
    private readonly userService = inject(UserService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly route = inject(ActivatedRoute);

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

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
        this.viewer = this.route.snapshot.data.viewer;
    }
}
