import {hmacSha256} from './datatrans.service';

describe('hmacSha256', () => {
    it('should get the translation from $localize', async () => {
        const key =
            '1a03b7bcf2752c8c8a1b46616b0c12658d2c7643403e655450bedb7c78bb2d2f659c2ff4e647e4ea72d37ef6745ebda6733c7b859439107069f291cda98f4844';

        expect(await hmacSha256(key, '123456789', {amount: '10000', currency: 'CHF', refno: '1007'})).toBe(
            'e591bc45430b1a14ad7e1a3a14a8218fb9a5ae944557c96366ec98feae6b17f4',
        );

        expect(await hmacSha256(key, '123456789', {amount: '10000', currency: 'CHF', refno: '1008'})).toBe(
            '3005b015945fb625ee25d7d804a65cc17f9dacd4fcba72329d34c8081230c146',
        );
    });
});
