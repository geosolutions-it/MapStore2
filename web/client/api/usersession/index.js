/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import ConfigUtils from "../../utils/ConfigUtils";
import browser from "./browser";
import server from "./server";
export const Providers = {
    browser,
    server
};

const getProvider = () => {
    return ConfigUtils.getConfigProp("userSessions")?.provider || "browser";
};

/**
 * User Session Persistence API.
 * Defines all the API endpoints, and delegates a configurable provider for the implementation.
 * All the endpoints return an Observable.
 *
 * You can register new providers in the Providers object (name -> implementation) and switch to a different
 * implementation setting the UserSession.provider property.
 *
 * Each session has a unique name that identifies it. The name is built from map and user information that allows to
 * identify different sessions for different scenarios (e.g. mapId + userName).
 *
 * When a new session is created, the provider generates a simple id that can be used to identify the session to be updated
 * or removed.
 */
const UserSession = {
    /**
     * Retrieves a session by name.
     * @param {string} name unique name of the session to fetch.
     * @returns {Observable} an array of the session id and the session object ([id, session])
     */
    getSession: name => Providers[getProvider()].getSession(name),
    /**
     * Creates a new user session (by name) or updates an existing one (by id)
     * @param {*} id identifier of the existing session, if undefined or null, a new session will be created
     * @param {string} name name of the session, to be used to fetch the session with getSession, mandatory
     * @param {string} user identifier of the current user (needed by some provider)
     * @param {object} session session to be persisted
     * @returns {Observable} identifier of the created / updated
     */
    writeSession: (id, name, user, session) => Providers[getProvider()].writeSession(id, name, user, session),
    /**
     * Removes a session, by id.
     * @param {*} session identifier
     * @returns {Observable} id of the removed session
     */
    removeSession: id => Providers[getProvider()].removeSession(id)
};

export default UserSession;
