
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    UPDATE_ADDITIONAL_LAYER,
    REMOVE_ADDITIONAL_LAYER,
    UPDATE_OPTIONS_BY_OWNER,
    REMOVE_ALL_ADDITIONAL_LAYERS
} = require('../actions/additionallayers');
const { head, pickBy, identity, isObject, isArray } = require('lodash');

function additionallayers(state = [], action) {
    switch (action.type) {
    case UPDATE_ADDITIONAL_LAYER: {

        const newLayerItem = pickBy({
            id: action.id,
            owner: action.owner,
            actionType: action.actionType,
            options: action.options
        }, identity);

        const currentLayerItem = head(state.filter(({id}) => id === newLayerItem.id));

        if (currentLayerItem) {
            return state.map(layerItem => layerItem.id === newLayerItem.id ? {...currentLayerItem, ...newLayerItem} : {...layerItem});
        }

        return [
            ...state,
            newLayerItem
        ];
    }
    case UPDATE_OPTIONS_BY_OWNER: {
        const {options, owner} = action;
        return state.map((layerItem, idx) => layerItem.owner === owner ? {
            ...layerItem,
            options: isObject(options) && options[layerItem.id] || isArray(options) && options[idx] || {}
        } : {...layerItem});
    }
    case REMOVE_ADDITIONAL_LAYER: {
        const {id, owner} = action;
        return owner ? state.filter(layerItem => layerItem.owner !== owner) : state.filter(layerItem => layerItem.id !== id);
    }
    case REMOVE_ALL_ADDITIONAL_LAYERS: {
        return [];
    }
    default:
        return state;
    }
}

module.exports = additionallayers;
