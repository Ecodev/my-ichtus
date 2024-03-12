import {Component} from '@angular/core';
import {BootLoaderComponent} from './shared/components/boot-loader/boot-loader.component';
import {RouterOutlet} from '@angular/router';
import {NgProgressComponent} from 'ngx-progressbar';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: true,
    imports: [FlexModule, NgProgressComponent, RouterOutlet, BootLoaderComponent],
})
export class AppComponent {
    public title = 'my-ichtus';

    public initialized = false;
}
