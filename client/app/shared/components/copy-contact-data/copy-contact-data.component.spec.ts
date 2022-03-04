import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BookingsWithOwnerContactVariables, EmailAndPhoneUsersVariables} from '../../generated-types';
import {CopyContactDataComponent} from './copy-contact-data.component';
import {MaterialModule} from '../../modules/material.module';
import {mockApolloProvider} from '../../testing/MockApolloProvider';

describe('CopyContactDataComponent', () => {
    let component: CopyContactDataComponent<EmailAndPhoneUsersVariables | BookingsWithOwnerContactVariables>;
    let fixture: ComponentFixture<
        CopyContactDataComponent<EmailAndPhoneUsersVariables | BookingsWithOwnerContactVariables>
    >;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CopyContactDataComponent],
            imports: [MaterialModule],
            providers: [mockApolloProvider],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CopyContactDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
