import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SupportComponent} from './support.component';
import {IchtusModule} from '../../../shared/modules/ichtus.module';
import {ApolloTestingModule} from 'apollo-angular/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('SupportComponent', () => {
    let component: SupportComponent;
    let fixture: ComponentFixture<SupportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [ApolloTestingModule, RouterTestingModule, IchtusModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SupportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
