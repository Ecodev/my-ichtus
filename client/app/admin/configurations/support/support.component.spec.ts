import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SupportComponent, SupportComponentData} from './support.component';
import {IchtusModule} from '../../../shared/modules/ichtus.module';
import {ApolloTestingModule} from 'apollo-angular/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

describe('SupportComponent', () => {
    let component: SupportComponent;
    let fixture: ComponentFixture<SupportComponent>;

    beforeEach(
        waitForAsync(() => {
            const dialogData: SupportComponentData = {
                configurationKey: 'foo',
            };

            TestBed.configureTestingModule({
                declarations: [],
                imports: [ApolloTestingModule, RouterTestingModule, IchtusModule],
                providers: [{provide: MAT_DIALOG_DATA, useValue: dialogData}],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SupportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
