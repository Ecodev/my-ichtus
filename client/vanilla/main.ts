import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {VanillaModule} from './vanilla.module';
import {environment} from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(VanillaModule, {
        ngZone: 'noop',
    })
    .catch(err => console.error(err));
