/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {Observable} from "rxjs";
import browser from "./browser";
import server from "./server";
import {userSessionBackupFrequencySelector} from "../../selectors/usersession";

let backupCounter = 1;
export const reset = (value = 1) => {
    backupCounter = value;
};
const doEvery = (num, observable, defaultValue) => {
    if (backupCounter === num) {
        backupCounter = 1;
        return observable();
    }
    backupCounter++;
    return Observable.of(defaultValue);
};

/**
 * User Session Persistence Provider that uses browser storage (frequent save), and server as a backup (less frequent).
 */
export default {
    getSession: name => Observable.forkJoin(
        browser.getSession(name),
        server.getSession(name)
    ).switchMap(([local, remote]) => {
        const [localId, localSession] = local;
        const [remoteId, remoteSession] = remote;
        return Observable.of([{
            local: localId,
            remote: remoteId
        }, localSession || remoteSession]);
    }),
    writeSession: (id, name, user, session) => Observable.forkJoin(
        browser.writeSession(id?.local, name, user, session),
        doEvery(userSessionBackupFrequencySelector(), () => server.writeSession(id?.remote, name, user, session), id?.remote),
    ).switchMap(([localId, remoteId]) => Observable.of({
        local: localId,
        remote: remoteId
    })),
    removeSession: id => Observable.forkJoin(
        browser.removeSession(id?.local),
        server.removeSession(id?.remote).catch(() => Observable.of(id?.remote))
    )
};
