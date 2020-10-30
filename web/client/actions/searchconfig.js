/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_SEARCH_CONFIG_PROP = 'SET_SEARCH_CONFIG_PROP';
export const RESET_SEARCH_CONFIG = 'RESET_SEARCH_CONFIG';
export const UPDATE_SERVICE = 'UPDATE_SERVICE';

/**
* Sets a property
* @memberof actions.search
* @param {string} property the property to set
* @param {string|number|boolean|object} value the value to set or to check for toggling
* @return {object} of type `SET_SEARCH_CONFIG_PROP` with property and value params
*/
export function setSearchConfigProp(property, value) {
    return {
        type: SET_SEARCH_CONFIG_PROP,
        property,
        value
    };
}

export function restServiceConfig(page = 0 ) {
    return {
        type: RESET_SEARCH_CONFIG,
        page
    };
}
export function updateService(service, idx = -1) {
    return {
        type: UPDATE_SERVICE,
        service,
        idx
    };
}

/**
* Actions for search
* @name actions.searchconfig
*/
