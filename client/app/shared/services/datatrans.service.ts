import {Inject, Injectable} from '@angular/core';
import CryptoES from 'crypto-es';
import {DOCUMENT} from '@angular/common';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface Config {
    params: {
        merchantId: string;
        sign: string;
        production: boolean;
        endpoint: string;
        refno: string;
        /**
         * The amount to pay in cents.
         *
         * If you want to pay 25.00 CHF, then the value must be `"2500"`.
         */
        amount: string;
        currency: 'CHF' | 'EUR';
    };
    paymentId?: string;
    opened?: () => void;
    success?: () => void;
    error?: (data: {message: string}) => void;
    cancel?: () => void;
}

type AllowedCss = Record<'width' | 'height' | 'overflow' | 'position', string>;

function stringifyReplacer(key: string, value: unknown): unknown {
    if (key.length > 0 && typeof value === 'object') {
        return undefined;
    }
    return value;
}

@Injectable({
    providedIn: 'root',
})
export class DatatransService {
    private preservedStyles: {html: string; body: string} = {html: '', body: ''};
    private paymentFrame: HTMLDivElement | null = null;
    private paymentForm: HTMLFormElement | null = null;
    private readonly cleaningUp = new Subject<void>();
    private readonly window: Window;
    private readonly lockStyles: Record<'html' | 'body', Partial<AllowedCss>> = {
        html: {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        },
        body: {
            width: '100%',
            height: '100%',
            overflow: 'visible',
            position: 'fixed',
        },
    };

    public constructor(@Inject(DOCUMENT) private readonly document: Document) {
        const window = this.document.defaultView;
        if (!window) {
            throw new Error('Cannot use DatatransService without window');
        }

        this.window = window;
    }

    private createElementWithAttributes<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        attrs: Record<string, string>,
    ): HTMLElementTagNameMap[K] {
        const elem = this.document.createElement(tag);
        if (!attrs) {
            return elem;
        }

        Object.keys(attrs).forEach(name => {
            elem.setAttribute(name, attrs[name]);
        });

        return elem;
    }

    private preventResubmitWithBackButton(): void {
        // Inject a fake state
        this.window.history.pushState(null, '', this.window.location.href);

        // When user go back to our fake state, destroy the iframe
        // so data cannot be resubmitted when going back one more time.
        // One more back might trigger a full refresh of an Angular app though,
        // but at least the user-experience is not entirely broken
        fromEvent(this.window, 'popstate', {capture: false})
            .pipe(takeUntil(this.cleaningUp))
            .subscribe(() => this.cleanup());
    }

    private applyStyle(element: HTMLElement, style: Partial<AllowedCss>): void {
        Object.entries(style).forEach(([key, value]) => {
            if (value === undefined) {
                return;
            }

            element.style[key as unknown as keyof AllowedCss] = value;
        });
    }

    private toggleLockHostPage(toggle?: boolean): void {
        const html = this.document.documentElement; // '<html>'
        const body = this.document.body;
        const lockAttr = html.getAttribute('data-datatrans-payment-lock') || 'unlocked';
        const doActivate = toggle !== undefined ? toggle : lockAttr === 'unlocked';
        let scrollPos;

        if (doActivate) {
            html.setAttribute('data-datatrans-payment-lock', 'locked');
            scrollPos = body.scrollTop;
            this.preservedStyles = {
                html: html.getAttribute('style') ?? '',
                body: body.getAttribute('style') ?? '',
            };
            this.applyStyle(html, this.lockStyles.html);
            this.applyStyle(body, this.lockStyles.body);
            body.style.top = '' + -scrollPos;
        } else {
            scrollPos = -parseInt(body.style.top, 10);
            html.setAttribute('style', this.preservedStyles.html);
            body.setAttribute('style', this.preservedStyles.body);
            body.scrollTop = scrollPos;
            body.style.top = '';
            html.setAttribute('data-datatrans-payment-lock', 'unlocked');
        }
    }

    public cleanup(): void {
        // Remove all event listeners
        this.cleaningUp.next();

        this.toggleLockHostPage(false);
        if (this.paymentForm && this.paymentForm.parentNode) {
            this.paymentForm.parentNode.removeChild(this.paymentForm);
        }

        if (this.paymentFrame && this.paymentFrame.parentNode) {
            this.paymentFrame.parentNode.removeChild(this.paymentFrame);
        }

        this.paymentFrame = null;
        this.paymentForm = null;
    }

    public startPayment(config: Config): void {
        this.toggleLockHostPage();

        if (typeof config.opened === 'function') {
            config.opened();
        }

        const params = {
            ...config.params,
            theme: 'DT2015',
            version: '2.0.0',
        };

        let action = config.params.endpoint + '/upp/jsp/upStart.jsp';
        let method = 'post';

        if (config.paymentId !== undefined) {
            action = config.params.endpoint + '/upp/v1/start/' + config.paymentId;
            method = 'get';
        }

        this.paymentForm = this.createElementWithAttributes('form', {
            id: 'datatransPaymentForm',
            name: 'datatransPaymentForm',
            method: method,
            style: 'display: none;',
            action: action,
            target: 'datatransPaymentFrame',
        });

        Object.entries(params).forEach(([name, value]) => {
            if (!this.paymentForm) {
                return;
            }

            if (typeof value === 'object') {
                this.paymentForm.appendChild(
                    this.createElementWithAttributes('input', {
                        type: 'hidden',
                        name: name,
                        value: JSON.stringify(value, stringifyReplacer),
                    }),
                );
            } else {
                this.paymentForm.appendChild(
                    this.createElementWithAttributes('input', {
                        type: 'hidden',
                        name: name,
                        value: '' + value,
                    }),
                );
            }
        });

        this.paymentForm.appendChild(
            this.createElementWithAttributes('input', {
                type: 'hidden',
                name: 'uppReturnTarget',
                value: '_self', // changed
            }),
        );

        this.paymentForm.appendChild(
            this.createElementWithAttributes('input', {
                type: 'hidden',
                name: 'mode',
                value: 'lightbox',
            }),
        );

        this.paymentForm.appendChild(
            this.createElementWithAttributes('input', {
                type: 'hidden',
                name: 'language',
                value: 'fr',
            }),
        );

        this.paymentFrame = this.createElementWithAttributes('div', {
            id: 'paymentFrameWrapper',
            style: 'z-index: 9999; position: fixed; right: 0; bottom: 0; left: 0; top: 0; overflow: hidden; -webkit-transform: translate3d(0, 0, 0); display: none',
        });

        this.paymentFrame.appendChild(
            this.createElementWithAttributes('iframe', {
                id: 'datatransPaymentFrame',
                name: 'datatransPaymentFrame',
                frameborder: '0',
                allowtransparency: 'true',
                style: 'border: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-transform: translate3d(0, 0, 0);',
            }),
        );

        this.document.body.appendChild(this.paymentFrame);
        this.document.body.appendChild(this.paymentForm);

        fromEvent<MessageEvent>(this.window, 'message')
            .pipe(takeUntil(this.cleaningUp))
            .subscribe(event => {
                if (event.data === 'cancel') {
                    this.cleanup();
                    if (config.cancel) {
                        config.cancel();
                    }
                } else if (event.data === 'frameReady') {
                    this.preventResubmitWithBackButton();
                    if (this.paymentFrame) {
                        this.paymentFrame.style.display = 'block';
                    }
                } else if (
                    typeof event.data === 'object' &&
                    ['success', 'error', 'cancel'].includes(event.data.status)
                ) {
                    const callback = config[event.data.status as 'success' | 'error' | 'cancel'];
                    if (callback) {
                        callback(event.data);
                    }
                    this.cleanup();
                }
            });

        this.paymentForm.submit();
    }

    public getHexaSHA256Signature(
        aliasCC: string,
        hexaKey: string,
        merchandId: string,
        amount: string,
        currency: 'CHF' | 'EUR',
        refno: string,
    ): string {
        if (hexaKey === null) {
            throw new Error('Missing HMAC key');
        }

        const valueToSign = aliasCC + merchandId + amount + currency + refno;
        const wordKey = CryptoES.enc.Hex.parse(hexaKey);
        const wordSig = CryptoES.HmacSHA256(valueToSign, wordKey);

        return CryptoES.enc.Hex.stringify(wordSig);
    }
}
