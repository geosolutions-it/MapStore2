/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const REDUCERS_LOADED = 'REDUCERS_LOADED';
/**
 * Action that should be dispatched whenever new reducers are added
 * @param {string[]} reducers list of reducers loaded
 * @returns {{reducers, type: string}}
 */
export const reducersLoaded = (reducers) => ({
    type: REDUCERS_LOADED,
    reducers
});
