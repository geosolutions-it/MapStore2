/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {Observable} from "rxjs";
import { getApi } from '../userPersistedStorage';

export const getSessionName = (name) => "mapstore.usersession." +
    (window.location.host + window.location.pathname).replace(/[^\w]/g, "_") + "." + name;

/**
 * User Session Persistence Provider based on browser localStorage.
 */
export default {
    getSession: name => Observable.defer(() => {
        try {
            const serialized = getApi().getItem(getSessionName(name));
            const session = serialized && JSON.parse(serialized);
            const id = session && name;
            return Promise.resolve([id, session]);
        } catch (e) {
            console.error(e);
            return Promise.resolve([0, null]);
        }
    }),
    writeSession: (id, name, user, session) => Observable.defer(() => {
        try {
            getApi().setItem(getSessionName(id || name), JSON.stringify(session));
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve(id || name);
    }),
    removeSession: id => Observable.defer(() => {
        getApi().removeItem(getSessionName(id));
        return Promise.resolve(id);
    })
};
