import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SupportComponent, SupportComponentData} from './support.component';
import {IchtusModule} from '../../../shared/modules/ichtus.module';
import {RouterTestingModule} from '@angular/router/testing';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {NaturalDialogTriggerProvidedData} from '@ecodev/natural';
import {mockApolloProvider} from '../../../shared/testing/MockApolloProvider';

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
            declarations: [],
            imports: [RouterTestingModule, IchtusModule],
            providers: [{provide: MAT_DIALOG_DATA, useValue: dialogData}, mockApolloProvider],
        }).compileComponents();

        fixture = TestBed.createComponent(SupportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
