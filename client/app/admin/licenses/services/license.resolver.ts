import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {ErrorService} from '../../../shared/components/error/error.service';
import {LicenseService} from './license.service';
import {LicenseResolve} from '../license';

@Injectable({
    providedIn: 'root',
})
export class LicenseResolver implements Resolve<LicenseResolve> {
    constructor(private readonly licenseService: LicenseService, private readonly errorService: ErrorService) {}

    /**
     * Resolve license data for router
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<LicenseResolve> {
        const observable = this.licenseService.resolve(route.params.licenseId);

        return this.errorService.redirectIfError(observable);
    }
}
