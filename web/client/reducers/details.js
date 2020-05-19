/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    EDIT,
    SET_CONTENT,
    SET_EDITED_CONTENT,
    SET_SETTINGS,
    SET_EDITED_SETTINGS,
    CHANGE_SETTING,
    RESET,
    LOADING
} from '../actions/details';
import { set } from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case EDIT: {
        return {
            ...state,
            editing: action.mode,
            editedContent: state.editing !== 'content' && action.mode === 'content' ? state.content : state.editedContent,
            editedSettings: state.editing !== 'settings' && action.mode === 'settings' ? state.settings : state.editedSettings,
            contentChanged: state.editing === 'content' && action.mode !== 'content' ? false : state.contentChanged
        };
    }
    case SET_CONTENT: {
        return set('content', action.content, state);
    }
    case SET_EDITED_CONTENT: {
        return {
            ...state,
            editedContent: action.content,
            contentChanged: action.setChanged
        };
    }
    case SET_SETTINGS: {
        return set('settings', action.settings, state);
    }
    case SET_EDITED_SETTINGS: {
        return set('editedSettings', action.settings, state);
    }
    case CHANGE_SETTING: {
        return set(`editedSettings[${action.id}]`, action.settingData, state);
    }
    case RESET: {
        return {};
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
};
