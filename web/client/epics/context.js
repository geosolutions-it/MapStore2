/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { get, pick, isObject, cloneDeep } from 'lodash';

import { LOCATION_CHANGE } from 'connected-react-router';

import MapUtils from '../utils/MapUtils';
import { getResource, getResourceIdByName, getResourceDataByName } from '../api/persistence';
import { pluginsSelectorCreator } from '../selectors/localConfig';
import { isLoggedIn } from '../selectors/security';
import { mapSelector } from '../selectors/map';
import { layersSelector, groupsSelector } from '../selectors/layers';
import { backgroundListSelector } from '../selectors/backgroundselector';
import { textSearchConfigSelector } from '../selectors/searchconfig';
import { mapOptionsToSaveSelector } from '../selectors/mapsave';

import { LOAD_CONTEXT, LOAD_FINISHED, loadContext, loading, setContext, setResource, contextLoadError, loadFinished,
    SET_CURRENT_CONTEXT, CONTEXT_LOAD_ERROR, MERGE_TEMPLATE, REPLACE_TEMPLATE } from '../actions/context';
import { loadMapConfig, configureMap, MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR } from '../actions/config';
import { changeMapType } from '../actions/maptype';
import { LOGIN_SUCCESS, LOGOUT } from '../actions/security';


import { wrapStartStop } from '../observables/epics';
import ConfigUtils from '../utils/ConfigUtils';


function MapError(error) {
    this.originalError = error;
    this.name = 'map';
}
function ContextError(error) {
    this.originalError = error;
    this.name = "context";
}
const createContextFlow = (id, action$, getState) =>
    (id !== "default"
        ? getResource(id)
            // TODO: setContext should put in ConfigUtils some variables
            // TODO: solve the problem of initial state used to configure plugins partially
            .switchMap(resource => {
                const templates = get(resource, 'data.templates', []);
                return Observable.forkJoin(
                    Observable.of(resource),
                    ...templates.map(({id: templateId}) =>
                        getResource(templateId).switchMap(templateResource => Observable.of({
                            ...pick(templateResource, 'name', 'description', 'id', 'data'),
                            thumbnail: get(templateResource, 'attributes.thumbnail')
                        }))
                    )
                );
            })
            .switchMap(([resource, ...templates]) => Observable.of(setResource(resource), setContext({...resource.data, templates})))
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
const createMapFlow = (mapId = 'new', mapConfig, action$) => {
    const { configUrl } = ConfigUtils.getConfigUrl({ mapId });
    return Observable.of(loadMapConfig(configUrl, mapId === 'new' ? null : mapId, mapConfig)).merge(
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
 * Handles the load of map and context together.
 * @param {observable} action$ stream of actions
 * @param {object} store
 */
export const loadContextAndMap = (action$, { getState = () => { } } = {}) =>
    action$.ofType(LOAD_CONTEXT).switchMap(({ mapId, contextName }) =>
        Observable.merge(
            getResourceIdByName('CONTEXT', contextName)
                .switchMap(id => createContextFlow(id, action$, getState)).catch(e => {throw new ContextError(e); }),
            (mapId ? Observable.of(null) : getResourceDataByName('CONTEXT', contextName))
                .switchMap(data => createMapFlow(mapId, data && data.mapConfig, action$, getState)).catch(e => { throw new MapError(e); })
        )
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
            )
    );

/**
 * Handles map type change when context changes
 * @param {observable} action$ stream of actions
 */
export const setMapTypeOnContextChange = action$ => action$
    .ofType(SET_CURRENT_CONTEXT)
    .switchMap(({context}) => Observable.of(changeMapType(context && context.mapType || 'openlayers')));

/**
 * Handles the reload of the context and map.
 * @param {observable} action$ stream of actions
 */
export const handleLoginLogoutContextReload = action$ => {
    return Observable.merge(
        // in case of forbidden error...
        action$.ofType(CONTEXT_LOAD_ERROR)
            .filter(({ error }) => error.status === 403)
            .switchMap( () =>  action$.ofType(LOGIN_SUCCESS).take(1).takeUntil(action$.ofType(LOCATION_CHANGE))), // ...wait for login success
        // Or if context was loaded
        action$.ofType(LOAD_FINISHED)
            .switchMap(() => action$.ofType(LOGOUT).take(1).takeUntil(action$.ofType(LOCATION_CHANGE))) // ...and then the user logged out
    // then reload the last context and map
    ).withLatestFrom(
        action$.ofType(LOAD_CONTEXT)
    ).switchMap(([, args]) => Observable.of(loadContext(args)));
};

export const mergeTemplateEpic = (action$, store) => action$
    .ofType(MERGE_TEMPLATE)
    .switchMap(({data}) => {
        if (isObject(data) && data.map !== undefined) {
            const state = store.getState();
            const map = mapSelector(state);
            const layers = layersSelector(state);
            const groups = groupsSelector(state);
            const backgrounds = backgroundListSelector(state);
            const textSearchConfig = textSearchConfigSelector(state);
            const additionalOptions = mapOptionsToSaveSelector(state);

            const currentConfig = MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, additionalOptions);

            const newConfig = MapUtils.mergeMapConfigs(currentConfig, data);
            return Observable.of(configureMap(cloneDeep(newConfig), null));
        }

        return Observable.empty();
    });

export const replaceTemplateEpic = (action$) => action$
    .ofType(REPLACE_TEMPLATE)
    .switchMap(({data}) => {
        return isObject(data) && data.map !== undefined ? Observable.of(configureMap(cloneDeep(data), null)) : Observable.empty();
    });
