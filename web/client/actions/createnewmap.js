/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SHOW_NEW_MAP_DIALOG = 'CREATENEWMAP:SHOW_NEW_MAP_DIALOG';
export const CREATE_NEW_MAP = 'CREATENEWMAP:CREATE_NEW_MAP';
export const HAS_CONTEXTS = 'CREATENEWMAP:HAS_CONTEXTS';
export const SET_NEW_MAP_CONTEXT = 'CREATENEWMAP:SET_NEW_MAP_CONTEXT';
export const LOADING = 'CREATENEWMAP:LOADING';

export const showNewMapDialog = (show) => ({
    type: SHOW_NEW_MAP_DIALOG,
    show
});

export const createNewMap = (context) => ({
    type: CREATE_NEW_MAP,
    context
});

export const hasContexts = (value) => ({
    type: HAS_CONTEXTS,
    value
});

export const setNewMapContext = (context) => ({
    type: SET_NEW_MAP_CONTEXT,
    context
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});
