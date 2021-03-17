/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {Observable} from "rxjs";

export const getSessionName = (name) => "mapstore.usersession." +
    (window.location.host + window.location.pathname).replace(/[^\w]/g, "_") + "." + name;

/**
 * User Session Persistence Provider based on browser localStorage.
 */
export default {
    getSession: name => Observable.defer(() => {
        let serialized = {};
        try {
            serialized = localStorage.getItem(getSessionName(name));
        } catch (e) {
            console.error(e);
        }
        const session = serialized && JSON.parse(serialized);
        const id = session && name;
        return Promise.resolve([id, session]);
    }),
    writeSession: (id, name, user, session) => Observable.defer(() => {
        try {
            localStorage.setItem(getSessionName(id || name), JSON.stringify(session));
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve(id || name);
    }),
    removeSession: id => Observable.defer(() => {
        localStorage.removeItem(getSessionName(id));
        return Promise.resolve(id);
    })
};
