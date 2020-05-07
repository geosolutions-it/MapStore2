/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


export const ADD_MAP_POPUP = 'MAP:ADD_POPUP';
export const REMOVE_MAP_POPUP = 'MAP:REMOVE_POPUP';
export const CLEAN_MAP_POPUPS = 'MAP:CLEAN_POPUPS';

export const addPopup = (id, options, single = true) => ({
    type: ADD_MAP_POPUP,
    id,
    popup: { id, ...options},
    single
});

export const removePopup = (id) => ({
    type: REMOVE_MAP_POPUP,
    id
});

export const cleanPopups = () => ({
    type: CLEAN_MAP_POPUPS
});
