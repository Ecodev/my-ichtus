/* globals define module */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Datatrans = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    var extend = function(defaults, options) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    var createElementWithAttributes = function(tag, attrs) {
        var elem = document.createElement(tag);
        if (!attrs) {
            return elem;
        }

        Object.keys(attrs).forEach(function(name) {
            elem.setAttribute(name, attrs[name]);
        });

        return elem;
    };

    var stringifyReplacer = function(key, value) {
        if ((key.length > 0) && typeof value === 'object') {
            return undefined;
        }
        return value;
    };

    var lockStyles = {
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

    var preservedStyles = {};

    var toggleLockHostpage = function(toggle) {
        var html = document.documentElement; // '<html>'
        var body = document.body;
        var lockAttr = html.getAttribute('data-datatrans-payment-lock') || 'unlocked';
        var doActivate = toggle !== undefined ? toggle : lockAttr === 'unlocked';
        var scrollPos;

        if (doActivate) {
            html.setAttribute('data-datatrans-payment-lock', 'locked');
            scrollPos = body.scrollTop;
            preservedStyles = {
                html: html.getAttribute('style'),
                body: body.getAttribute('style'),
            };
            Object.keys(lockStyles.html || {}).forEach(function(key) {
                html.style[key] = lockStyles.html[key];
            });
            Object.keys(lockStyles.body || {}).forEach(function(key) {
                body.style[key] = lockStyles.body[key];
            });
            body.style.top = -scrollPos;
        } else {
            scrollPos = -(parseInt(body.style.top, 10));
            html.setAttribute('style', preservedStyles.html);
            body.setAttribute('style', preservedStyles.body);
            body.scrollTop = scrollPos;
            body.style.top = '';
            html.setAttribute('data-datatrans-payment-lock', 'unlocked');
        }
    };

    var paymentFrame;
    var paymentForm;
    var windowEventHandler;
    var cleanup;

    var startPayment = function(config) {
        cleanup = function() {
            toggleLockHostpage(false);
            paymentForm.parentNode.removeChild(paymentForm);
            paymentFrame.parentNode.removeChild(paymentFrame);
            if (window.removeEventListener) {
                window.removeEventListener('message', windowEventHandler);
            } else if (window.detachEvent) {
                window.detachEvent('message', windowEventHandler);
            }
        };

        toggleLockHostpage();

        if (typeof config.opened === 'function') {
            config.opened();
        }

        var params = extend({}, config.params);

        params['theme'] = 'DT2015';
        params['version'] = '2.0.0';

        var action = config.params.endpoint + '/upp/jsp/upStart.jsp';
        var method = 'post';

        if (config.paymentId !== undefined) {
            action = config.params.endpoint + '/upp/v1/start/' + config.paymentId;
            method = 'get';
        }

        var needsRedirect = false;

        paymentForm = createElementWithAttributes('form', {
            id: 'datatransPaymentForm',
            name: 'datatransPaymentForm',
            'method': method,
            style: 'display: none;',
            action: action,
            target: 'datatransPaymentFrame',
        });

        for (var name in params) {
            if (name === 'paymentmethod') {
                return;
            }

            if (typeof params[name] === 'object') {
                paymentForm.appendChild(createElementWithAttributes('input', {
                    type: 'hidden',
                    name: name,
                    value: JSON.stringify(params[name], stringifyReplacer),
                }));
            } else {
                paymentForm.appendChild(createElementWithAttributes('input', {
                    type: 'hidden',
                    name: name,
                    value: params[name],
                }));
            }
        }

        paymentForm.appendChild(createElementWithAttributes('input', {
            type: 'hidden',
            name: 'uppReturnTarget',
            value: '_self', // changed
        }));

        paymentForm.appendChild(createElementWithAttributes('input', {
            type: 'hidden',
            name: 'mode',
            value: 'lightbox',
        }));

        paymentForm.appendChild(createElementWithAttributes('input', {
            type: 'hidden',
            name: 'language',
            value: 'fr',
        }));

        paymentFrame = createElementWithAttributes('div', {
            id: 'paymentFrameWrapper',
            style: 'z-index: 9999; position: fixed; right: 0; bottom: 0; left: 0; top: 0; overflow: hidden; -webkit-transform: translate3d(0, 0, 0); display: none',
        });

        paymentFrame.appendChild(createElementWithAttributes('iframe', {
            id: 'datatransPaymentFrame',
            name: 'datatransPaymentFrame',
            frameborder: '0',
            allowtransparency: 'true',
            style: 'border: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-transform: translate3d(0, 0, 0);',
        }));

        document.body.appendChild(paymentFrame);
        document.body.appendChild(paymentForm);

        windowEventHandler = function(event) {

            if (event.data === 'cancel') {
                cleanup();
            } else if (event.data === 'frameReady') {
                paymentFrame.style.display = 'block';
            } else if (typeof event.data === 'object' && ['success', 'error', 'cancel'].includes(event.data.status)) {

                const callback = config[event.data.status];
                if (typeof callback === 'function') {
                    callback(event.data);
                }
                cleanup();
            }
        };

        if (window.addEventListener) {
            window.addEventListener('message', windowEventHandler);
        } else if (window.attachEvent) {
            window.attachEvent('message', windowEventHandler);
        }

        if (needsRedirect) {
            location.href = redirectUrl;
        } else {
            paymentForm.submit();
        }
    };

    return {
        startPayment: startPayment,
        close: function() {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        },
    };
}));
