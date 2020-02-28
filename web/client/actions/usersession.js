/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SAVE_USER_SESSION = "USER_SESSION:SAVE";
export const USER_SESSION_SAVED = "USER_SESSION:SAVED";
export const USER_SESSION_LOADING = "USER_SESSION:LOADING";
export const saveUserSession = () => ({type: SAVE_USER_SESSION});
export const userSessionSaved = (id, session) => ({type: USER_SESSION_SAVED, id, session});

export const loading = (value, name = "loading") => ({
    type: USER_SESSION_LOADING,
    name,
    value
});
