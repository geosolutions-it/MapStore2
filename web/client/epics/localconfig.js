/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {LOCAL_CONFIG_LOADED, supportedLanguagesRegistered} = require('../actions/localConfig');
const LocaleUtils = require('../utils/LocaleUtils');
const {get} = require('lodash');

/**
 * Epics for cookies policy informations
 * @name epics.cookies
 * @type {Object}
 */


/**
 * set available languages
 * @memberof epics.localConfig
 * @param {external:Observable} action$ manages `LOCAL_CONFIG_LOADED`
 * @return {external:Observable} SUPPORTED_LOCALES_REGISTERED if some supported locales are returned
 */


const setSupportedLocales = (action$) =>
    action$.ofType(LOCAL_CONFIG_LOADED)
        .switchMap(action => {
            const supportedLocales = get(action, "config.initialState.defaultState.locales.supportedLocales", {});
            if (Object.keys(supportedLocales).length === 0) {
                return Rx.Observable.of(supportedLanguagesRegistered({}));
            }
            LocaleUtils.setSupportedLocales(supportedLocales);
            return Rx.Observable.of(supportedLanguagesRegistered(supportedLocales));
        });


module.exports = {
    setSupportedLocales
};
