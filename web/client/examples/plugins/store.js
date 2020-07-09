/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {combineReducers, combineEpics} = require('../../utils/PluginsUtils');
const {createDebugStore} = require('../../utils/DebugUtils').default;
const LayersUtils = require('../../utils/LayersUtils');

const {createEpicMiddleware} = require('redux-observable');

const map = require('../../reducers/map');

const layers = require('../../reducers/layers');
const mapConfig = require('../../reducers/config');

module.exports = (plugins, custom) => {
    const allReducers = combineReducers(plugins, {
        locale: require('../../reducers/locale'),
        browser: require('../../reducers/browser'),
        theme: require('../../reducers/theme').default,
        map: () => {return null; },
        mapInitialConfig: () => {return null; },
        layers: () => {return null; },
        pluginsConfig: require('./reducers/config'),
        custom
    });
    const standardEpics = {
        ...require('../../epics/config'),
        ...require('../../epics/controls')
    };
    const rootEpic = combineEpics(plugins, {...standardEpics });
    const epicMiddleware = createEpicMiddleware(rootEpic);

    const rootReducer = (state, action) => {
        if (action.type === 'LOADED_STATE') {
            return action.state;
        }
        let mapState = LayersUtils.splitMapAndLayers(mapConfig(state, action));
        let newState = {
            ...allReducers(state, action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            mapInitialConfig: mapState ? mapState.mapInitialConfig : null,
            layers: mapState ? layers(mapState.layers, action) : null
        };
        return newState;
    };

    return createDebugStore(rootReducer, {}, [epicMiddleware]);
};
