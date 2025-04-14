import {Component, effect, inject, viewChild} from '@angular/core';
import {BootLoaderComponent} from './shared/components/boot-loader/boot-loader.component';
import {RouterOutlet} from '@angular/router';
import {NgProgressbar, NgProgressRef} from 'ngx-progressbar';
import {NetworkActivityService} from '@ecodev/natural';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [NgProgressbar, RouterOutlet, BootLoaderComponent],
})
export class AppComponent {
    private readonly networkActivityService = inject(NetworkActivityService);
    private readonly ngProgressRef = viewChild.required(NgProgressRef);

    public initialized = false;

    public constructor() {
        effect(() => this.networkActivityService.setProgressRef(this.ngProgressRef()));
    }
}
