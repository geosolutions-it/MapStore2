/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DELETE_MAP = 'MAPCATALOG:DELETE_MAP';
export const SAVE_MAP = 'MAPCATALOG:SAVE_MAP';
export const SET_FILTER_RELOAD_DELAY = 'MAPCATALOG:SET_FILTER_RELOAD_DELAY';
export const TRIGGER_RELOAD = 'MAPCATALOG:TRIGGER_RELOAD';

export const deleteMap = (resource) => ({
    type: DELETE_MAP,
    resource
});

export const saveMap = (resource) => ({
    type: SAVE_MAP,
    resource
});

export const setFilterReloadDelay = (delay) => ({
    type: SET_FILTER_RELOAD_DELAY,
    delay
});

export const triggerReload  = () => ({
    type: TRIGGER_RELOAD
});
