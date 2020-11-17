import {browser, by, element} from 'protractor';

export class AppPage {
    private navigateTo(): void {
        return browser.get('/');
    }

    private getParagraphText(): void {
        return element(by.css('app-root h1')).getText();
    }
}
