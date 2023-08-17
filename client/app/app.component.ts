import {Component} from '@angular/core';
import {BootLoaderComponent} from './shared/components/boot-loader/boot-loader.component';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {NgProgressComponent} from 'ngx-progressbar';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [FlexModule, NgProgressComponent, RouterOutlet, CommonModule, BootLoaderComponent],
})
export class AppComponent {
    public title = 'my-ichtus';

    public initialized = false;
}
