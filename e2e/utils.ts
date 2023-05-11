import {execFileSync, execSync} from 'child_process';
import {DocumentNode} from '@apollo/client/core';
import {Page, Response} from '@playwright/test';
import {getOperationName} from '@apollo/client/utilities';

export function formControlName(name: string): string {
    return `input[formcontrolname="${name}"],mat-checkbox[formcontrolname="${name}"],natural-select[formcontrolname="${name}"]`;
}

export function buttonLabel(label: string): string {
    return `//button[contains(., '${label}')]`;
}

export async function naturalSelect(page: Page, selector: string, value: string): Promise<unknown> {
    const element = await page.waitForSelector(selector);
    await (await element.$('input'))?.fill(value);

    return page.click(`//mat-option/span[contains(., "${value}")]`);
}

function getPhpBinary(): string {
    return execSync('which php8.1 || which php').toString().trim();
}

/**
 * Execute a SQL query via our PHP CLI
 */
export function runSql(sql: string): void {
    const php = getPhpBinary();
    const args = ['./bin/doctrine', 'dbal:run-sql', sql];

    execFileSync(php, args);
}

/**
 * Wait for a network response to a request that contains at least the given GraphQL query
 */
export function graphqlRequest(document: DocumentNode): (response: Response) => boolean {
    const operationName = getOperationName(document);

    return response => {
        if (response.url().match(/\/graphql($|\?)/)) {
            return !!response.request().postData()?.match(`"operationName":"${operationName}"`);
        }

        return false;
    };
}
