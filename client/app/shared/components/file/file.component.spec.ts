import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FileComponent} from './file.component';
import {IchtusModule} from '../../modules/ichtus.module';

describe('FileComponent', () => {
    let component: FileComponent;
    let fixture: ComponentFixture<FileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [IchtusModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
