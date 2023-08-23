import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {LicenseService} from './license.service';

/**
 * Resolve license data for router
 */
export function resolveLicense(route: ActivatedRouteSnapshot): ReturnType<LicenseService['resolve']> {
    const licenseService = inject(LicenseService);
    const errorService = inject(ErrorService);
    const observable = licenseService.resolve(route.params.licenseId).pipe(last());

    return errorService.redirectIfError(observable);
}
