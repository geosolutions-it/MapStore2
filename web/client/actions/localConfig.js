/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const LOCAL_CONFIG_LOADED = 'LOCAL_CONFIG_LOADED';
export const SUPPORTED_LOCALES_REGISTERED = 'LOCAL_CONFIG:SUPPORTED_LOCALES_REGISTERED';

export function localConfigLoaded(config) {
    return {
        type: LOCAL_CONFIG_LOADED,
        config
    };
}
export function supportedLanguagesRegistered(locales) {
    return {
        type: SUPPORTED_LOCALES_REGISTERED,
        locales
    };
}
