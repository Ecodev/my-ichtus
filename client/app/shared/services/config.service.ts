import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { Literal } from '../../natural/types/types';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {

    private configUrl = 'assets/config/config.local.json';
    private config = new BehaviorSubject<Literal | null>(null);

    constructor(private http: HttpClient) {
        this.http.get(this.configUrl).pipe(catchError(() => {
            console.error('La configuration front-end n\'a pas pu être chargée !');
            return of(null);
        })).subscribe(result => {
            if (result) {
                this.config.next(result);
            }
        });

    }

    public get(): BehaviorSubject<Literal | null> {
        return this.config;
    }

}