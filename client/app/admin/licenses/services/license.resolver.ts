import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {last, Observable} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {LicenseService} from './license.service';
import {LicenseResolve} from '../license';

/**
 * Resolve license data for router
 */
export function resolveLicense(route: ActivatedRouteSnapshot): Observable<LicenseResolve> {
    const licenseService = inject(LicenseService);
    const errorService = inject(ErrorService);
    const observable = licenseService.resolve(route.params.licenseId).pipe(last());

    return errorService.redirectIfError(observable);
}
