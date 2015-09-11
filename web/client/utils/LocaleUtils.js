/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var url = require('url');

const supportedLocales = {
     "it": {
         code: "it-IT",
         description: "Italiano"
     },
     "en": {
        code: "en-US",
        description: "English"
     }
};

var LocaleUtils = {
    getUserLocale: function() {
        return LocaleUtils.getLocale(url.parse(window.location.href, true).query);
    },
    getLocale: function(query) {
        let locale = supportedLocales[query.locale || (navigator ? navigator.language || navigator.browserLanguage : "en")];
        return locale ? locale.code : "en-US";
    },
    getSupportedLocales: function() {
        return supportedLocales;
    }
};

module.exports = LocaleUtils;
