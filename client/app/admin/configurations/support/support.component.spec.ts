import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SupportComponent, SupportComponentData} from './support.component';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NaturalDialogTriggerProvidedData, naturalProviders} from '@ecodev/natural';
import {mockApolloProvider} from '../../../shared/testing/MockApolloProvider';
import {provideRouter} from '@angular/router';

describe('SupportComponent', () => {
    let component: SupportComponent;
    let fixture: ComponentFixture<SupportComponent>;

    beforeEach(async () => {
        const dialogData: NaturalDialogTriggerProvidedData<SupportComponentData> = {
            data: {
                configurationKey: 'foo',
            },
            activatedRoute: null as any,
        };

        await TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                naturalProviders,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                mockApolloProvider,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SupportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
