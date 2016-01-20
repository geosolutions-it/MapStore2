/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var {combineReducers} = require('redux');

var mapConfig = require('../../../reducers/config');
var undoable = require('redux-undo').default;
var isEqual = require('lodash/lang/isEqual');
var mapConfigHistory = require('../../../utils/MapHistory');
var {searchResults} = require('../../../reducers/search');
var map = mapConfigHistory(undoable(require('../../../reducers/map'), {
    filter: (action, currentState, previousState) => {
        let bool = false;
        if (previousState && previousState.mapStateSource && previousState.mapStateSource === 'map'
                && previousState.center && previousState.zoom !== undefined) {
            // Check geometry part
            bool = !(isEqual(currentState.center, previousState.center) && currentState.zoom === previousState.zoom);
        }
        return bool;
    }
}));
var layers = require('../../../reducers/layers');
var browser = require('../../../reducers/browser');
var locale = require('../../../reducers/locale');
var DebugUtils = require('../../../utils/DebugUtils');
var assign = require('object-assign');
var {isArray} = require('lodash');

var getLayersByGroup = function(configLayers) {
    let i = 0;
    let mapLayers = configLayers.map((layer) => assign({}, layer, {storeIndex: i++}));
    let groupNames = mapLayers.reduce((groups, layer) => {
        return groups.indexOf(layer.group) === -1 ? groups.concat([layer.group]) : groups;
    }, []).filter((group) => group !== 'background');
    return groupNames.map((group) => {
        let groupName = group || 'Default';

        return assign({}, {
            id: groupName,
            name: groupName,
            title: groupName,
            nodes: mapLayers.filter((layer) => layer.group === group).map((layer) => layer.id).reverse(),
            expanded: true
        });
    }).reverse();
};

var reorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(allLayers.filter((layer) => (layer.group || 'Default') === group.name))
            .concat(reorderLayers((group.groups || []).slice(0).reverse(), allLayers, group.name + '.').reverse());
    }, []);
};

var reorder = (groups, allLayers) => {
    return allLayers.filter((layer) => layer.group === 'background').concat(reorderLayers(groups, allLayers));
};

module.exports = (reducers, initialState = {}) => {
    const reducersObj = assign({}, reducers, {
        // layers,
        locale,
        browser,
        searchResults,

        map: () => {return null; },
        layers: () => {return null; },
        configPlugins: () => {return null; }
    });
    const allReducers = combineReducers(reducersObj);
    const rootReducer = (state, action) => {
        let mapState = mapConfig({
            map: state && state.map,
            layers: state && state.layers,
            plugins: state && state.plugins
        }, action);
        if (mapState && isArray(mapState.layers)) {
            let groups = getLayersByGroup(mapState.layers);
            mapState.layers = {flat: reorder(groups, mapState.layers), groups: groups};
        }
        if (mapState && mapState.map && mapState.map.center) {
            mapState.map = {
                past: [],
                present: mapState.map,
                future: []
            };
        }
        let newState = {
            ...allReducers(state, action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            layers: mapState ? layers(mapState.layers, action) : null,
            configPlugins: mapState ? mapState.plugins : null
        };
        return newState;
    };
    return DebugUtils.createDebugStore(rootReducer, initialState);
};
