/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DELETE_MAP = 'MAPCATALOG:DELETE_MAP';
export const SAVE_MAP = 'MAPCATALOG:SAVE_MAP';
export const TRIGGER_RELOAD = 'MAPCATALOG:TRIGGER_RELOAD';

export const deleteMap = (resource) => ({
    type: DELETE_MAP,
    resource
});

export const saveMap = (resource) => ({
    type: SAVE_MAP,
    resource
});

export const triggerReload  = () => ({
    type: TRIGGER_RELOAD
});
