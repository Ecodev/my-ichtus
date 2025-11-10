import {expect, test} from '@playwright/test';
import {buttonLabel, formControlName, naturalSelect, runSql} from './utils';
import {AppPage} from './app.po';

test.describe('as anonymous', () => {
    let app: AppPage;
    test.beforeEach(({page}) => {
        app = new AppPage(page);
    });

    test('should subscribe, confirm and be logged in', async ({page}) => {
        await page.goto('/');
        await page.click(`//a[contains(., 'Adhérer')]`);

        const unique = '' + Date.now();
        const login = `e2e-${unique}`;
        const email = `${login}@example.com`;

        await page.type(formControlName('email'), email);
        await page.click(formControlName('termsAgreement'));
        await page.click(formControlName('privacyPolicyAgreement'));
        await page.click(buttonLabel('Adhérer'));

        expect(await app.getSnackBar()).toMatch(/Un email avec des instructions a été envoyé/);

        const token = '09876543210987654321098765432109';
        runSql(`UPDATE user
                SET token = NULL
                WHERE token = '${token}'`);
        runSql(`UPDATE user
                SET token               = '${token}',
                    token_creation_date = NOW()
                WHERE email = '${email}'`);

        await page.goto(`user/confirm/${token}`);

        await page.type(formControlName('login'), login);
        await page.type(formControlName('password'), unique);
        await page.type(formControlName('confirmPassword'), unique);
        await page.type(formControlName('firstName'), 'e2e-firstname');
        await page.type(formControlName('lastName'), 'e2e-lastName');
        await page.type(formControlName('street'), 'e2e-street');
        await page.type(formControlName('locality'), 'e2e-locality');
        await page.type(formControlName('postcode'), '2000');
        await naturalSelect(page, formControlName('country'), 'Suisse');
        await page.type(formControlName('mobilePhone'), '123 456 78');
        await page.type(formControlName('birthday'), '01.02.2003');

        await page.click(buttonLabel("Confirmer l'adhésion"));

        expect(await app.getSnackBar()).toMatch(/Merci d'avoir confirmé ton compte/);
        await app.checkUserInitials('EE');
    });
});
