/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var axios = require('../libs/ajax');

var LocaleUtils = require('../utils/LocaleUtils');

const CHANGE_LOCALE = 'CHANGE_LOCALE';
const LOCALE_LOAD_ERROR = 'LOCALE_LOAD_ERROR';

function changeLocale(data) {
    return {
        type: CHANGE_LOCALE,
        messages: data.messages,
        locale: data.locale
    };
}

function localeError(e) {
    return {
        type: LOCALE_LOAD_ERROR,
        error: e
    };
}

function loadLocale(translationFolder, language) {
    return (dispatch) => {
        let locale = language;
        if (!locale) {
            locale = LocaleUtils.getUserLocale();
        }
        return axios.get(translationFolder + '/data.' + locale).then((response) => {
            dispatch(changeLocale(response.data));
        }).catch((e) => {
            dispatch(localeError(e));
        });
    };
}

module.exports = {CHANGE_LOCALE, LOCALE_LOAD_ERROR, loadLocale};
