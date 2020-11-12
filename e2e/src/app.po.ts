import {browser, by, element} from 'protractor';

export class AppPage {
    private navigateTo() {
        return browser.get('/');
    }

    private getParagraphText() {
        return element(by.css('app-root h1')).getText();
    }
}
