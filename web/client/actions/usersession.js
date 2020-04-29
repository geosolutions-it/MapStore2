/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SAVE_USER_SESSION = "USER_SESSION:SAVE";
export const LOAD_USER_SESSION = "USER_SESSION:LOAD";
export const REMOVE_USER_SESSION = "USER_SESSION:REMOVE";
export const USER_SESSION_SAVED = "USER_SESSION:SAVED";
export const USER_SESSION_REMOVED = "USER_SESSION:REMOVED";
export const USER_SESSION_LOADED = "USER_SESSION:LOADED";
export const USER_SESSION_LOADING = "USER_SESSION:LOADING";
export const SAVE_MAP_CONFIG = "USER_SESSION:ORIGINAL_CONFIG";
export const USER_SESSION_START_SAVING = "USER_SESSION:START_SAVING";
export const USER_SESSION_STOP_SAVING = "USER_SESSION:STOP_SAVING";
export const SET_USER_SESSION = "USER_SESSION:SET";
export const ENABLE_AUTO_SAVE = "USER_SESSION:ENABLE_AUTO_SAVE";

export const saveUserSession = () => ({type: SAVE_USER_SESSION});
export const userSessionSaved = (id, session) => ({type: USER_SESSION_SAVED, id, session});
export const loadUserSession = (name = "") => ({type: LOAD_USER_SESSION, name});
export const userSessionLoaded = (id, session) => ({type: USER_SESSION_LOADED, id, session});
export const removeUserSession = () => ({type: REMOVE_USER_SESSION});
export const userSessionRemoved = () => ({type: USER_SESSION_REMOVED});
export const userSessionStartSaving = () => ({type: USER_SESSION_START_SAVING});
export const userSessionStopSaving = () => ({type: USER_SESSION_STOP_SAVING});
export const saveMapConfig = (config) => ({type: SAVE_MAP_CONFIG, config});
export const setUserSession = (session) => ({type: SET_USER_SESSION, session});
/**
 * Action to enable/disable the auto-save functionality.
 * @param {boolean} enabled flag to enable/disable the auto-save for session
 */
export const enableAutoSave = (enabled) => ({ type: ENABLE_AUTO_SAVE, enabled });

export const loading = (value, name = "loading") => ({
    type: USER_SESSION_LOADING,
    name,
    value
});
