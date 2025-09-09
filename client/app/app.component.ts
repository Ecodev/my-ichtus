import {Component, effect, inject, viewChild} from '@angular/core';
import {BootLoaderComponent} from './shared/components/boot-loader/boot-loader.component';
import {RouterOutlet} from '@angular/router';
import {NgProgressbar, NgProgressRef} from 'ngx-progressbar';
import {NetworkActivityService} from '@ecodev/natural';

@Component({
    selector: 'app-root',
    imports: [NgProgressbar, RouterOutlet, BootLoaderComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private readonly networkActivityService = inject(NetworkActivityService);
    private readonly ngProgressRef = viewChild.required(NgProgressRef);

    public initialized = false;

    public constructor() {
        effect(() => this.networkActivityService.setProgressRef(this.ngProgressRef()));
    }
}
