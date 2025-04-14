import {Component, inject, OnInit} from '@angular/core';
import {DoorConfig, DoorService} from './services/door.service';
import {NaturalAlertService} from '@ecodev/natural';
import {ActivatedRoute} from '@angular/router';
import {CurrentUserForProfile} from '../shared/generated-types';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CardComponent} from '../shared/components/card/card.component';

@Component({
    selector: 'app-door',
    templateUrl: './door.component.html',
    styleUrl: './door.component.scss',
    imports: [CardComponent, MatButtonModule, MatIconModule],
})
export class DoorComponent implements OnInit {
    public readonly doorService = inject(DoorService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly route = inject(ActivatedRoute);

    public viewer!: NonNullable<CurrentUserForProfile['viewer']>;

    public open(door: DoorConfig): void {
        this.doorService.open({door: door.enum}).subscribe({
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
