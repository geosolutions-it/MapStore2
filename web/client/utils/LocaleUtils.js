/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const url = require('url');
const {isObject} = require('lodash');
const {addLocaleData} = require('react-intl');

const en = require('react-intl/locale-data/en');
const it = require('react-intl/locale-data/it');
const fr = require('react-intl/locale-data/fr');
const de = require('react-intl/locale-data/de');
const es = require('react-intl/locale-data/es');
const nl = require('react-intl/locale-data/nl');
const zh = require('react-intl/locale-data/zh');
const hr = require('react-intl/locale-data/hr');
const pt = require('react-intl/locale-data/pt');
const vi = require('react-intl/locale-data/vi');
const fi = require('react-intl/locale-data/fi');

addLocaleData([...en, ...it, ...fr, ...de, ...es, ...nl, ...zh, ...hr, ...pt, ...vi, ...fi]);

/*
 * it, en, fr, de, es are the default locales and it is preferrable to customize them via configuration.
 * if you want to change it please read documentation guide on how to do this.
*/
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
    },
    "zh": {
        code: "zh-ZH",
        description: "中文"
    },
    "nl": {
        code: "nl-NL",
        description: "Nederlands"
    },
    "hr": {
        code: "hr-HR",
        description: "Hrvatski"
    },
    "pt": {
        code: "pt-PT",
        description: "Português"
    },
    "vi": {
        code: "vi-VN",
        description: "tiếng Việt"
    },
    "fi": {
        code: "fi-FI",
        description: "Suomi"
    }
};
const DATE_FORMATS = {
    "default": "YYYY/MM/DD",
    "en-US": "MM/DD/YYYY",
    "it-IT": "DD/MM/YYYY",
    "nl-NL": "DD/MM/YYYY",
    "zh-ZH": "YYYY/MM/DD",
    "hr-HR": "DD/MM/YYYY",
    "pt-PT": "DD/MM/YYYY",
    "vi-VN": "DD/MM/YYYY",
    "fi-FI": "DD/MM/YYYY"
};

let errorParser = {};

/**
 * Utilities for locales.
 * @memberof utils
 */
const LocaleUtils = {
    ensureIntl(callback) {
        require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js', 'intl/locale-data/jsonp/fr.js', 'intl/locale-data/jsonp/de.js', 'intl/locale-data/jsonp/es.js', 'intl/locale-data/jsonp/nl.js', 'intl/locale-data/jsonp/zh.js', 'intl/locale-data/jsonp/hr.js', 'intl/locale-data/jsonp/vi.js', 'intl/locale-data/jsonp/fi.js'], (require) => {
            global.Intl = require('intl');
            require('intl/locale-data/jsonp/en.js');
            require('intl/locale-data/jsonp/it.js');
            require('intl/locale-data/jsonp/fr.js');
            require('intl/locale-data/jsonp/de.js');
            require('intl/locale-data/jsonp/es.js');
            require('intl/locale-data/jsonp/nl.js');
            require('intl/locale-data/jsonp/zh.js');
            require('intl/locale-data/jsonp/hr.js');
            require('intl/locale-data/jsonp/pt.js');
            require('intl/locale-data/jsonp/vi.js');
            require('intl/locale-data/jsonp/fi.js');
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
    DATE_FORMATS,
    getMessageById: function(messages, msgId) {
        var message = messages;
        msgId.split('.').forEach(part => {
            message = message ? message[part] : null;
        });
        return message || msgId;
    },
    /**
     * Register a parser to translate error services
     * @param type {string} name of the service
     * @param parser {object} custom parser of the service
     */
    registerErrorParser: (type, parser) => {
        errorParser[type] = parser;
    },
    /**
     * Return localized id of error messages
     * @param e {object} error
     * @param service {string} service that thrown the error
     * @param section {string} section where the error happens
     * @return {object} {title, message}
     */
    getErrorMessage: (e, service, section) => {
        return service && section && errorParser[service] && errorParser[service][section] && errorParser[service][section](e) || {
            title: 'errorTitleDefault',
            message: 'errorDefault'
        };
    },
    /**
     * Retrieve localized string from object of translations
     * @param {string} locale code of locale, eg. en-US
     * @param {string|object} prop source of translation
     * @returns {string} localized string
     */
    getLocalizedProp: (locale, prop) => isObject(prop) ? prop[locale] || prop.default : prop || ''
};

module.exports = LocaleUtils;
