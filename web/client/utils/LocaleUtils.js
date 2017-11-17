/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const url = require('url');

const {addLocaleData} = require('react-intl');

const en = require('react-intl/locale-data/en');
const it = require('react-intl/locale-data/it');
const fr = require('react-intl/locale-data/fr');
const de = require('react-intl/locale-data/de');
const es = require('react-intl/locale-data/es');
const nl = require('react-intl/locale-data/nl');

addLocaleData([...en, ...it, ...fr, ...de, ...es, ...nl]);

let supportedLocales = {
    "it": {
        code: "it-IT",
        description: "Italiano"
    },
    "en": {
        code: "en-US",
        description: "English"
    },
    "fr": {
        code: "fr-FR",
        description: "Français"
    },
    "de": {
        code: "de-DE",
        description: "Deutsch"
    },

    "es": {
        code: "es-ES",
        description: "Español"
    }/*,
    "nl": {
        code: "nl-NL",
        description: "Nederlands"
    }*/
};
const DATE_FORMATS = {
    "default": "yyyy/MM/dd",
    "en-US": "MM/dd/yyyy",
    "it-IT": "dd/MM/yyyy",
    "nl-NL": "dd/MM/yyyy"
};
const LocaleUtils = {
    ensureIntl(callback) {
        require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js', 'intl/locale-data/jsonp/fr.js', 'intl/locale-data/jsonp/de.js', 'intl/locale-data/jsonp/es.js', 'intl/locale-data/jsonp/nl.js'], (require) => {
            global.Intl = require('intl');
            require('intl/locale-data/jsonp/en.js');
            require('intl/locale-data/jsonp/it.js');
            require('intl/locale-data/jsonp/fr.js');
            require('intl/locale-data/jsonp/de.js');
            require('intl/locale-data/jsonp/es.js');
            require('intl/locale-data/jsonp/nl.js');
            if (callback) {
                callback();
            }
        });
    },
    setSupportedLocales: function(locales) {
        supportedLocales = locales;
    },
    normalizeLocaleCode: function(localeCode) {
        var retval;
        if (localeCode === undefined || localeCode === null) {
            retval = undefined;
        } else {
            let rg = /^[a-z]+/i;
            let match = rg.exec(localeCode);
            if (match && match.length > 0) {
                retval = match[0].toLowerCase();
            } else {
                retval = undefined;
            }
        }
        return retval;
    },
    getUserLocale: function() {
        return LocaleUtils.getLocale(url.parse(window.location.href, true).query);
    },
    getLocale: function(query = {}) {
        const key = Object.keys(supportedLocales)[0];
        const defaultLocale = supportedLocales.en ? { key: 'en', locale: supportedLocales.en } : { key, locale: supportedLocales[key] };
        let locale = supportedLocales[
            LocaleUtils.normalizeLocaleCode(query.locale || (navigator ? navigator.language || navigator.browserLanguage : defaultLocale.key))
        ];
        return locale ? locale.code : defaultLocale.locale.code;
    },
    getSupportedLocales: function() {
        return supportedLocales;
    },
    getDateFormat(locale) {
        return DATE_FORMATS[locale] || DATE_FORMATS.default;
    },
    getMessageById: function(messages, msgId) {
        var message = messages;
        msgId.split('.').forEach(part => {
            message = message ? message[part] : null;
        });
        return message;
    }
};

module.exports = LocaleUtils;
