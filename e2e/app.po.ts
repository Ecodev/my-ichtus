import {formControlName, graphqlRequest} from './utils';
import {Page} from '@playwright/test';
import {permissionsQuery} from '../client/app/shared/services/permissions.queries';
import {currentUserForProfileQuery} from '../client/app/admin/users/services/user.queries';

export class AppPage {
    public constructor(private readonly page: Page) {}

    public checkUserInitials(initials: string): Promise<unknown> {
        return this.page.waitForSelector(`//app-home//mat-toolbar//natural-avatar[contains(., '${initials}')]`);
    }

    public async login(login: string): Promise<unknown> {
        await Promise.all([
            // Login page will load viewer, so we need to be sure we finish that before resetting Apollo store when login
            this.page.waitForResponse(graphqlRequest(currentUserForProfileQuery)),
            this.page.goto('login?logout=true'),
        ]);

        await this.page.type(formControlName('login'), login);
        await this.page.type(formControlName('password'), login);

        return await Promise.all([
            // Wait for the permissions to be fetched with the new user
            this.page.waitForResponse(graphqlRequest(permissionsQuery)),

            // Triggers the login
            this.page.click('button[type="submit"]'),
        ]);
    }

    public getSnackBar(): Promise<string> {
        return this.page.innerText('[matsnackbarlabel]');
    }
}
