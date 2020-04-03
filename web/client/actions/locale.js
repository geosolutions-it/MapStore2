/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var axios = require('../libs/ajax');

var LocaleUtils = require('../utils/LocaleUtils');

const ConfigUtils = require('../utils/ConfigUtils');

const CHANGE_LOCALE = 'CHANGE_LOCALE';
const LOCALE_LOAD_ERROR = 'LOCALE_LOAD_ERROR';

const {castArray, merge} = require('lodash');
const {Promise} = require('es6-promise');
const {error} = require('./notifications');

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

function appendLocale(folder) {
    return (dispatch, getState) => {
        axios.get(folder + `/data.${getState().locale.current}.json`)
            .then((response) => {
                if (typeof response.data === "string") {
                    try {
                        JSON.parse(response.data);
                    } catch (e) {
                        dispatch(localeError('Locale file broken  for (' + getState().locale.current + '): ' + e.message));
                    }
                }
                dispatch(changeLocale({ locale: getState().locale.current, messages: merge(getState().locale.messages, response.data.messages)}));
            }).catch((e) => {
                dispatch(localeError(e));
                dispatch(error({
                    title: "notification.warning",
                    message: e.status === 404 ? "localeErrors.404" : "Error loading locale",
                    action: {
                        label: "notification.warning"
                    },
                    position: "tc"
                }));

            });
    };
}

function loadLocale(translationFolder, language) {
    return (dispatch) => {
        let locale = language;
        if (!locale) {
            locale = LocaleUtils.getUserLocale();
        }
        const folders = castArray(translationFolder || ConfigUtils.getConfigProp('translationsPath'));
        Promise.all(folders.map((folder) => {
            return axios.get(folder + `/data.${locale}.json`).catch(e => e);
        })).then((responses) => {
            const validResponses = responses.filter(r => r.status === 200);
            const erroredResponses = responses.filter(r => r.status !== 404 && r.status !== 200);
            if (erroredResponses.length > 0 || validResponses.length === 0) {
                const e = responses[0];
                dispatch(localeError(e));
                dispatch(error({
                    title: "notification.warning",
                    message: validResponses.length === 0 ? "localeErrors.404" : "Error loading locale",
                    action: {
                        label: "notification.warning"
                    },
                    position: "tc"
                }));
            } else {
                dispatch(changeLocale(validResponses.reduce((previous, response) => {
                    if (typeof response.data === "string") {
                        try {
                            JSON.parse(response.data);
                        } catch (e) {
                            dispatch(localeError('Locale file broken  for (' + language + '): ' + e.message));
                        }
                        return previous;
                    }
                    return merge(previous, response.data);
                }, {})));
            }
        });
    };
}

module.exports = { CHANGE_LOCALE, LOCALE_LOAD_ERROR, loadLocale, appendLocale};
