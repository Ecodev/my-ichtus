import {TestBed} from '@angular/core/testing';
import {LocalizedPaginatorIntlService} from './localized-paginator-intl.service';

describe('LocalizedPaginatorIntlService', () => {
    let service: LocalizedPaginatorIntlService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
        });
        service = TestBed.inject(LocalizedPaginatorIntlService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get the translation from $localize', () => {
        expect(service.itemsPerPageLabel).toEqual('Par page');
        expect(service.nextPageLabel).toEqual('Suivant');
        expect(service.previousPageLabel).toEqual('Précédent');
        expect(service.getRangeLabel(0, 10, 20)).toEqual('1-10/20');
        expect(service.getRangeLabel(1, 5, 20)).toEqual('6-10/20');
        expect(service.getRangeLabel(2, 10, 0)).toEqual('0/0');
        expect(service.getRangeLabel(2, 0, 20)).toEqual('0/20');
    });
});
