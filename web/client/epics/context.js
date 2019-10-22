/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';


import { getResource } from '../api/persistence';
import { pluginsSelectorCreator } from '../selectors/localConfig';

import { LOAD_CONTEXT, loading, setContext, setResource } from '../actions/context';
import { loadMapConfig, MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR } from '../actions/config';
import { wrapStartStop } from '../observables/epics';
import ConfigUtils from '../utils/ConfigUtils';


const createContextFlow = (id, action$, getState) =>
    (id !== "default"
        ? getResource(id)
            // TODO: setContext should put in ConfigUtils some variables
            // TODO: solve the problem of initial state used to configure plugins partially
            .switchMap((resource) => Observable.of(setResource(resource), setContext(resource.data)))
        : Observable.of(
            setContext({
                plugins: {
                    desktop: pluginsSelectorCreator("desktop")(getState())
                }
            }) // TODO: select mobile if mobile browser
        )
    ).catch(e => {
        console.log(e);
        return Observable.of(loading(false, "loading")); // TODO: error
    }); // TODO: use default context ID

/**
 * Handles map load
 * @param {string|number} id id of the map
 * @param {*} action$ stream of actions
 */
const createMapFlow = (mapId = '0', action$) => {
    const { configUrl } = ConfigUtils.getConfigUrl({ mapId });
    return Observable.of(loadMapConfig(configUrl, mapId)).merge(
        action$.ofType(MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR)
            .switchMap(({ type }) => {
                if (type === MAP_CONFIG_LOAD_ERROR) {
                    return Observable.empty(); // TODO: handle error
                }
                return Observable.empty(); // complete;
            })
    );
};

export const loadContextAndMap = (action$, { getState = () => { } } = {}) =>
    action$.ofType(LOAD_CONTEXT).switchMap(({ mapId, contextId }) =>
        Observable.merge(
            createContextFlow(contextId, action$, getState),
            createMapFlow(mapId, action$, getState)
        ).let(
            wrapStartStop(
                loading(true, "loading"),
                loading(false, "loading")
            )
        )
    );
