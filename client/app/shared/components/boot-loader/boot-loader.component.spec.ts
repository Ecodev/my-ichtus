import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BootLoaderComponent} from './boot-loader.component';

describe('BootLoaderComponent', () => {
    let component: BootLoaderComponent;
    let fixture: ComponentFixture<BootLoaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        fixture = TestBed.createComponent(BootLoaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
