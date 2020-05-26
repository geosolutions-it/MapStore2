/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SAVE = 'DETAILS:SAVE';
export const SAVE_SUCCESS = 'DETAILS:SAVE_SUCCESS';
export const EDIT = 'DETAILS:EDIT';
export const CANCEL_EDIT = 'DETAILS:CANCEL_EDIT';
export const CLOSE = 'DETAILS:CLOSE';
export const SET_CONTENT = 'DETAILS:SET_CONTENT';
export const SET_EDITED_CONTENT = 'DETAILS:SET_EDITED_CONTENT';
export const SET_SETTINGS = 'DETAILS:SET_SETTINGS';
export const SET_EDITED_SETTINGS = 'DETAILS:SET_EDITED_SETTINGS';
export const CHANGE_SETTING = 'DETAILS:CHANGE_SETTING';
export const RESET = 'DETAILS:RESET';
export const LOADING = 'DETAILS:LOADING';

export const save = () => ({
    type: SAVE
});

export const saveSuccess = () => ({
    type: SAVE_SUCCESS
});

export const edit = (active) => ({
    type: EDIT,
    active
});

export const cancelEdit = () => ({
    type: CANCEL_EDIT
});

export const close = () => ({
    type: CLOSE
});

export const setContent = (content) => ({
    type: SET_CONTENT,
    content
});

export const setEditedContent = (content, setChanged) => ({
    type: SET_EDITED_CONTENT,
    content,
    setChanged
});

export const setSettings = (settings) => ({
    type: SET_SETTINGS,
    settings
});

export const setEditedSettings = (settings) => ({
    type: SET_EDITED_SETTINGS,
    settings
});

export const changeSetting = (id, settingData) => ({
    type: CHANGE_SETTING,
    id,
    settingData
});

export const reset = () => ({
    type: RESET
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});
