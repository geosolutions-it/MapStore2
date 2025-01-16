/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { error, success } from '../actions/notifications';
import { SAVE_USER_SESSION, LOAD_USER_SESSION, REMOVE_USER_SESSION, USER_SESSION_REMOVED,
    USER_SESSION_START_SAVING, USER_SESSION_STOP_SAVING,
    userSessionSaved, userSessionLoaded, loading, saveUserSession, userSessionRemoved,
    userSessionStartSaving, userSessionStopSaving
} from "../actions/usersession";
import { closeFeatureGrid } from '../actions/featuregrid';
import { resetSearch } from '../actions/search';
import { LOCATION_CHANGE } from "connected-react-router";
import UserSession from "../api/usersession";
import {loadMapConfig} from "../actions/config";
import {LOGOUT} from '../actions/security';

import {userSelector} from '../selectors/security';
import { wrapStartStop } from '../observables/epics';
import {originalConfigSelector, userSessionNameSelector, userSessionIdSelector,
    userSessionSaveFrequencySelector, userSessionToSaveSelector, isAutoSaveEnabled,
    checkedSessionToClear} from "../selectors/usersession";
import { REDUCERS_LOADED } from '../actions/storemanager';
import { setSearchBookmarkConfig } from '../actions/searchbookmarkconfig';
import { onInitPlayback } from '../actions/playback';
import { setSearchConfigProp } from '../actions/searchconfig';
import { updateOverrideConfig } from '../utils/ConfigUtils';
import { setTemplates } from '../actions/maptemplates';
import { getRegisterHandlers } from '../selectors/mapsave';

const {getSession, writeSession} = UserSession;

const saveUserSessionErrorStatusToMessage = (status) => {
    switch (status) {
    default:
        return 'userSession.saveErrorNotification.defaultMessage';
    }
};

/**
 * Returns a user session save epic.
 * The epic triggers on a SAVE_USER_SESSION action.
 *
 * @param {*} sessionSelector selector that builds the session object to save
 * @param {function} nameSelector selector that builds the session identifier
 * @param {*} idSelector selector of the identifier for the current session (if it already exists)
 * @example
 *
 * const sessionSelector = (state) => ({state.map.present})
 * const nameSelector = (state) => ({state.context.name + "." + state.security.user.name})
 * const idSelector = (state) => ({state.usersession.id})
 * const epic = saveUserSessionEpicCreator(nameSelector, sessionSelector, idSelector)
 * setInterval(() => dispatch({type: SAVE_USER_SESSION}), 60 * 1000)
 */
export const saveUserSessionEpicCreator = (sessionSelector = userSessionToSaveSelector, nameSelector = userSessionNameSelector, idSelector = userSessionIdSelector) => (action$, store) => action$
    .ofType(SAVE_USER_SESSION)
    .switchMap(() => {
        const state = store.getState();
        const session = sessionSelector(state);
        const id = idSelector(state);
        const name = nameSelector(state);
        const userName = userSelector(state)?.name;
        // no behaviour defined for not logged users defied yet
        // SAVE_USER_SESSION should not be triggered in this case.
        if (!userName) {
            return Rx.Observable.empty();
        }
        return writeSession(id, name, userName, session).switchMap(rid => {
            return Rx.Observable.of(
                userSessionSaved(rid, session)
            );
        }).let(wrapStartStop(
            loading(true, 'userSessionSaving'),
            loading(false, 'userSessionSaving'),
            ({ status, data }) => {
                return Rx.Observable.of(error({
                    title: 'userSession.saveErrorNotification.titleContext',
                    message: saveUserSessionErrorStatusToMessage(status),
                    position: "tc",
                    autoDismiss: 5,
                    values: {
                        data
                    }
                }));
            }
        ));
    });

/**
 * Returns an epic that saves a user session (dispatching the saveUserSession action creator)
 * at defined intervals.
 * It can be started and stopped by two specific actions (configurable).
 * @param {number} frequency interval between saves (in milliseconds)
 * @param {function} finalAction optional action creator emitted after stop
 */
export const autoSaveSessionEpicCreator = (frequency, finalAction) =>
    (action$, store) => action$.ofType(USER_SESSION_START_SAVING)
        .switchMap(() =>
            Rx.Observable.interval(frequency || userSessionSaveFrequencySelector(store.getState()))
                .filter(() => isAutoSaveEnabled(store.getState()))
                .switchMap(() => Rx.Observable.of(saveUserSession()))
                .takeUntil(action$.ofType(USER_SESSION_STOP_SAVING))
                .concat(finalAction ? Rx.Observable.of(finalAction()) : Rx.Observable.empty())
        );

/**
 * Returns an epic that loads the user session, triggered by a LOAD_USER_SESSION action.
 *
 * @param {function} nameSelector selector that builds the session identifier
 */
export const loadUserSessionEpicCreator = (nameSelector = userSessionNameSelector) => (action$, store) =>
    action$.ofType(LOAD_USER_SESSION).switchMap(({name}) => {
        const state = store.getState();
        const sessionName = name || nameSelector(state);
        return getSession(sessionName)
            .switchMap(([id, session]) => Rx.Observable.of(
                userSessionLoaded(id, session)
            ))
            .let(wrapStartStop(
                loading(true, 'userSessionLoading'),
                loading(false, 'userSessionLoading'),
                () => Rx.Observable.of(userSessionLoaded(undefined, undefined))
            ));
    });

/**
 * Returns a user session remove epic.
 * The epic triggers on a REMOVE_USER_SESSION action.
 *
 * @param {function} idSelector selector of the identifier for the current session (to be removed)
 * @example
 *
 * const idSelector = (state) => ({state.usersession.id})
 * const epic = removeUserSessionEpicCreator(idSelector)
 *
 * In order to clean up all plugins state as and where expected,
 * closeFeatureGrid and resetSearch actions are included in the stream
 */
export const removeUserSessionEpicCreator = (idSelector = userSessionIdSelector, nameSelector = userSessionNameSelector) => (action$, store) =>
    action$.ofType(REMOVE_USER_SESSION).switchMap(() => {
        const state = store.getState();

        const checks = checkedSessionToClear(store.getState());
        const id = idSelector(state);
        const name = nameSelector(state);
        const userName = userSelector(state)?.name;
        const mapConfig = originalConfigSelector(store.getState());
        // update new Session
        const newSession = updateOverrideConfig(userSessionToSaveSelector(state), checks, mapConfig, getRegisterHandlers());
        // TODO: check whether to remove or update session on session serviceListOpenSelector(browser, server)
        return writeSession(id, name, userName, newSession).switchMap(() => Rx.Observable.of(userSessionRemoved(newSession), closeFeatureGrid(), resetSearch(), success({
            title: "success",
            message: "userSession.successUpdated"
        }))).let(wrapStartStop(
            loading(true, 'userSessionRemoving'),
            loading(false, 'userSessionRemoving'),
            () => Rx.Observable.of(error({
                title: 'userSession.removeErrorNotification.titleContext',
                message: 'userSession.removeErrorNotification.defaultMessage',
                position: "tc",
                autoDismiss: 5
            }))
        ));
    });

/**
 * Epic used to implement user session removal: reloads the original context or map configuration.
 *
 * @param {observable} action$ stream of actions
 * @param {object} store
 */
export const reloadOriginalConfigEpic = (action$, { getState = () => { } } = {}) =>
    action$.ofType(USER_SESSION_REMOVED).switchMap(({newSession}) => {
        const mapConfig = originalConfigSelector(getState());
        const mapId = getState()?.mapInitialConfig?.mapId;
        return Rx.Observable.of(loadMapConfig(null, mapId, mapConfig, undefined, newSession || {}), userSessionStartSaving());
    });

export const stopSaveSessionEpic = (action$) =>
    // when auto save is activated
    action$.ofType(USER_SESSION_START_SAVING).switchMap(() =>
        action$.ofType(USER_SESSION_REMOVED, LOCATION_CHANGE, LOGOUT)
            .switchMap(() => Rx.Observable.of(userSessionStopSaving())));

// some of the reducer are not ready when MAP_CONFIG_LOADED where merging of states takes place
// to handle initial update of states whose reducer are later initialized
// TODO: find better way to handle this, MAP_CONFIG_LOADED is loading before reducer initialization
export const setSessionToDynamicReducers = (action$, store) => {
    return action$.ofType(REDUCERS_LOADED).switchMap(() => {
        const state = store.getState();
        let observables = [];

        // only enabled in context map and has session
        if (!state.context?.resource || !state.usersession?.session) return Rx.Observable.empty();

        if (state.usersession?.session?.map?.bookmark_search_config) {
            observables.push(Rx.Observable.of(setSearchBookmarkConfig('bookmarkSearchConfig', state.usersession?.session?.map?.bookmark_search_config)));
        }
        if (state.usersession?.session?.playback) {
            observables.push(Rx.Observable.of(onInitPlayback({ ...state.usersession.session.playback })));
        }
        if (state.usersession?.session?.map?.text_search_config) {
            observables.push(Rx.Observable.of(setSearchConfigProp('textSearchConfig', state.usersession?.session?.map?.text_search_config)));
        }
        // mapTemplates
        if (state.usersession?.session?.mapTemplates) {
            observables.push(Rx.Observable.of(setTemplates(state.usersession?.session.mapTemplates)));
        }

        return observables.length > 0 ? Rx.Observable.merge(...observables) : Rx.Observable.empty();
    });
};
