/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';

import { LOCAL_CONFIG_LOADED, supportedLanguagesRegistered } from '../actions/localConfig';
import {setSupportedLocales as setSupportedLocalesUtil} from '../utils/LocaleUtils';
import { get } from 'lodash';

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


export const setSupportedLocales = (action$) =>
    action$.ofType(LOCAL_CONFIG_LOADED)
        .switchMap(action => {
            const supportedLocales = get(action, "config.initialState.defaultState.locales.supportedLocales", {});
            if (Object.keys(supportedLocales).length === 0) {
                return Rx.Observable.of(supportedLanguagesRegistered({}));
            }
            setSupportedLocalesUtil(supportedLocales);
            return Rx.Observable.of(supportedLanguagesRegistered(supportedLocales));
        });


export default {
    setSupportedLocales
};
