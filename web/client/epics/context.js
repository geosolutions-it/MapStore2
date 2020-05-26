/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';

import { LOCATION_CHANGE } from 'connected-react-router';

import { getResource, getResourceIdByName, getResourceDataByName } from '../api/persistence';
import { pluginsSelectorCreator } from '../selectors/localConfig';
import { isLoggedIn, userSelector } from '../selectors/security';

import { LOAD_CONTEXT, LOAD_FINISHED, loadContext, loading, setContext, setResource, contextLoadError, loadFinished,
    SET_CURRENT_CONTEXT, CONTEXT_LOAD_ERROR } from '../actions/context';
import { clearMapTemplates } from '../actions/maptemplates';
import { loadMapConfig, MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR } from '../actions/config';
import { changeMapType } from '../actions/maptype';
import { LOGIN_SUCCESS, LOGOUT } from '../actions/security';
import { loadUserSession, USER_SESSION_LOADED, userSessionStartSaving, setUserSession, saveMapConfig } from '../actions/usersession';

import { wrapStartStop } from '../observables/epics';
import ConfigUtils from '../utils/ConfigUtils';
import {userSessionEnabledSelector, buildSessionName} from "../selectors/usersession";
import merge from "lodash/merge";

function MapError(error) {
    this.originalError = error;
    this.name = 'map';
}
function ContextError(error) {
    this.originalError = error;
    this.name = "context";
}

/**
 * Finalizes the context configuration flow, with session management if enabled.
 *
 * @param {String} id context resource identifier
 * @param {Object} session optional session to integrate with the context configuration
 * @param {Function} getState state extraction function
 *
 * @returns {Observable} context configuration flow
 */
const createContextFlow = (id, session = {}, getState) =>
    (id !== "default"
        ? getResource(id)
            // TODO: setContext should put in ConfigUtils some variables
            // TODO: solve the problem of initial state used to configure plugins partially
            .switchMap((resource) => Observable.of(setResource(resource), setContext(merge({}, resource.data, session))))
        : Observable.of(
            setContext({
                plugins: {
                    desktop: pluginsSelectorCreator("desktop")(getState())
                }
            }) // TODO: select mobile if mobile browser
        )
    ); // TODO: use default context ID

/**
 * Handles map load. Delegates to config epics triggering loadMapConfig
 * @param {string|number} id id of the map
 * @param {*} action$ stream of actions
 */
const createMapFlow = (mapId = 'new', mapConfig, session, action$) => {
    const { configUrl } = ConfigUtils.getConfigUrl({ mapId });
    return (mapConfig ? Observable.of(
        saveMapConfig(mapConfig),
        loadMapConfig(configUrl, mapId === 'new' ? null : mapId, mapConfig, undefined, session || {})
    ) : Observable.of(
        loadMapConfig(configUrl, mapId === 'new' ? null : mapId, mapConfig, undefined, session || {})
    )).merge(
        action$.ofType(MAP_CONFIG_LOAD_ERROR)
            .switchMap(({ type, error }) => {
                if (type === MAP_CONFIG_LOAD_ERROR) {
                    throw error;
                }

            }).takeUntil(action$.ofType(MAP_CONFIG_LOADED))
    );
};

const errorToMessageId = (name, e, getState = () => {}) => {
    let message = `context.errors.${name}.unknownError`;
    if (e.status === 403) {
        message = `context.errors.${name}.pleaseLogin`;
        if (isLoggedIn(getState())) {
            message = `context.errors.${name}.notAccessible`;
        }
    } if (e.status === 404) {
        message = `context.errors.${name}.notFound`;
    }
    return message;
};

/**
 * Creates a context loading flow, including session management, if enabled.
 *
 * @param {String} mapId current map identifier, if any
 * @param {String} contextName name of the context configuration to load
 * @param {Observable} action$ stream of actions
 * @param {Function} getState state extraction function
 *
 * @returns {Observable} flow to load the current context (with session, if enabled)
 */
const createSessionFlow = (mapId, contextName, action$, getState) => {
    return Observable.forkJoin(
        getResourceIdByName('CONTEXT', contextName),
        (mapId ? Observable.of(null) : getResourceDataByName('CONTEXT', contextName))
    ).flatMap(([id, data]) => {
        const userName = userSelector(getState())?.name;
        return Observable.of(loadUserSession(buildSessionName(id, mapId, userName))).merge(
            action$.ofType(USER_SESSION_LOADED).take(1).switchMap(({session}) => {
                const mapSession = session?.map && {
                    map: session.map
                };
                const contextSession = session?.context && {
                    ...session.context
                };
                return Observable.merge(
                    Observable.of(clearMapTemplates()),
                    createContextFlow(id, contextSession, getState).catch(e => {throw new ContextError(e); }),
                    createMapFlow(mapId, data && data.mapConfig, mapSession, action$, getState).catch(e => { throw new MapError(e); }),
                    Observable.of(setUserSession(session)),
                    Observable.of(userSessionStartSaving())
                );
            })
        );
    });
};

/**
 * Handles the load of map and context together.
 * @param {observable} action$ stream of actions
 * @param {object} store
 */
export const loadContextAndMap = (action$, { getState = () => { } } = {}) =>
    action$.ofType(LOAD_CONTEXT).switchMap(({ mapId, contextName }) => {
        const sessionsEnabled = userSessionEnabledSelector(getState());
        const flow = sessionsEnabled
            ? createSessionFlow(mapId, contextName, action$, getState)
            : Observable.merge(
                Observable.of(clearMapTemplates()),
                getResourceIdByName('CONTEXT', contextName)
                    .switchMap(id => createContextFlow(id, null, getState)).catch(e => {throw new ContextError(e); }),
                (mapId ? Observable.of(null) : getResourceDataByName('CONTEXT', contextName))
                    .switchMap(data => createMapFlow(mapId, data && data.mapConfig, null, action$, getState)).catch(e => { throw new MapError(e); })
            );
        return flow
            // if everything went right, trigger loadFinished
            .concat(Observable.of(loadFinished()))
            // wrap with loading events
            .let(
                wrapStartStop(
                    loading(true, "loading"),
                    [loading(false, "loading")],
                    e => {
                        const messageId = errorToMessageId(e.name, e.originalError, getState);
                        // prompt login should be triggered here
                        return Observable.of(contextLoadError({ error: {...e.originalError, messageId} }) );
                    }
                )
            );

    });

/**
 * Handles map type change when context changes
 * @param {observable} action$ stream of actions
 */
export const setMapTypeOnContextChange = action$ => action$
    .ofType(SET_CURRENT_CONTEXT)
    .switchMap(({context}) => Observable.of(changeMapType(context && context.mapType || 'openlayers')));

/**
 * Handles the reload of the context and map. This have to be triggered
 * When access conditions change due to login/logout events.
 * This allows to correctly reload the context (and the eventual user session map and context changes)
 * @param {observable} action$ stream of actions
 */
export const handleLoginLogoutContextReload = action$ =>
    // If the was a forbidden error (access denied to the given context)
    action$.ofType(CONTEXT_LOAD_ERROR).filter(({ error }) => error.status === 403)
        //  or in case of context successfully loaded
        .merge(action$.ofType(LOAD_FINISHED))
        // on login-logout event
        .switchMap(() => action$.ofType(LOGIN_SUCCESS, LOGOUT).take(1).takeUntil(action$.ofType(LOCATION_CHANGE)))
        // re-trigger the last context load event to re-load context and map ()
        .withLatestFrom(action$.ofType(LOAD_CONTEXT))
        .switchMap(([, args]) => Observable.of(loadContext(args)));
