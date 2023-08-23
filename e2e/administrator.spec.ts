import {expect, test} from '@playwright/test';

import {AppPage} from './app.po';
import {bigButton, formControlName, menu, menuCategory, runSql} from './utils';

test.describe('accounting', () => {
    let app: AppPage;

    test.describe('as administrator', () => {
        test.beforeEach(async ({page}) => {
            app = new AppPage(page);
            await app.login('administrator');
        });

        test('should be logged', async () => {
            await app.checkUserInitials('AI');
        });

        test('can duplicate transaction', async ({page}) => {
            // Init duplication
            await page.click(bigButton('Administration'));
            await page.click(menuCategory('Comptabilité'));
            await page.click(menu('Écritures'));
            await page.click(`//a[contains(., 'Acquisition voilier NE123456')]`);
            await page.click(`//eco-fab-speed-dial-trigger`);
            await page.click(`[mattooltip='Dupliquer ...']`);
            await page.waitForSelector(`//natural-detail-header[contains(., 'Nouvelle transaction')]`);

            // Complete form
            const unique = 'e2e-' + Date.now();
            await page.type(formControlName('transactionDate'), '2022-01-01');
            await page.type(formControlName('name'), unique);
            await page.type(`app-editable-transaction-lines tr:first-of-type input[formcontrolname="name"]`, unique);

            // Save
            await page.click(`//natural-fixed-button`);
            expect(await app.getSnackBar()).toMatch(/Créé/);

            // Wait to be exceptionally redirected to empty creation page
            await page.waitForSelector(`//natural-detail-header[contains(., 'Nouvelle transaction')]`);

            // Go back to list and check duplicated content actually exist
            await page.click(`//natural-detail-header//a[contains(., 'Transaction')]`);
            await page.click(`//a[contains(., '${unique}')]`);
            expect(await page.innerText('natural-detail-header')).toContain(unique);
            expect(await page.innerText('//natural-detail-header//app-money')).toMatch(/CHF 10’000.00/);

            runSql(`DELETE
                    FROM transaction
                    WHERE name LIKE '${unique}%'`);
        });

        test('can process expenseClaim', async ({page}) => {
            runSql(`UPDATE expense_claim
                    SET status = 'new'
                    WHERE name = 'achats Jumbo'`);
            runSql(`DELETE
                    FROM transaction
                    WHERE id IN (SELECT transaction.id
                                 FROM transaction
                                          INNER JOIN expense_claim
                                                     ON transaction.expense_claim_id = expense_claim.id AND
                                                        expense_claim.name = 'achats Jumbo')`);

            // Init processing
            await page.click(bigButton('Administration'));
            await page.click(menuCategory('Comptabilité'));
            await page.click(menu('Frais, remboursements et factures'));
            await page.click(`//a[contains(., 'achats Jumbo')]`);
            await page.click(`//a[contains(., 'Créditer le solde')]`);
            await page.waitForSelector(`//natural-detail-header[contains(., 'Nouvelle transaction')]`);

            // Complete form
            const unique = 'e2e-' + Date.now();
            await page.type(formControlName('name'), unique);
            await page.type(`app-editable-transaction-lines tr:first-of-type input[formcontrolname="name"]`, unique);

            // Save
            await page.click(`//natural-fixed-button`);
            expect(await app.getSnackBar()).toMatch(/Créé/);

            // Wait to be exceptionally redirected to empty creation page
            await page.waitForSelector(`//natural-detail-header[contains(., 'Nouvelle transaction')]`);

            // Go back to list and check reimbursement actually exist
            await page.click(`//natural-detail-header//a[contains(., 'Transaction')]`);
            await page.click(`//a[contains(., '${unique}')]`);
            expect(await page.innerText('natural-detail-header')).toContain(
                unique + 'Traitement de la dépense "achats Jumbo"',
            );
            await page.waitForSelector(`//app-transaction-lines[contains(., '${unique}Remboursement sur le solde')]`);
            expect(await page.innerText('//natural-detail-header//app-money')).toMatch(/CHF 200.00/);
        });
    });
});
