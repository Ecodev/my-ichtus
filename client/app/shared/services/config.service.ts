import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, shareReplay} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

export interface FrontEndConfig {
    datatrans: {
        merchantId: string;
        key: string;
        sign: string;
        production: boolean;
        endpoint: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private readonly configUrl = 'assets/config/config.local.json';
    public readonly config: Observable<FrontEndConfig | null>;

    constructor(http: HttpClient) {
        this.config = http.get<FrontEndConfig>(this.configUrl).pipe(
            catchError(() => {
                console.error("La configuration front-end n'a pas pu être chargée !");

                return of(null);
            }),
            shareReplay(),
        );
    }
}
