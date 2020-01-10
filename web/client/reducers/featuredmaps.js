/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { ATTRIBUTE_UPDATED, MAP_DELETED, MAP_METADATA_UPDATED, PERMISSIONS_UPDATED, MAPS_LIST_LOADING, FEATURED_MAPS_SET_ENABLED, FEATURED_MAPS_SET_LATEST_RESOURCE} = require('../actions/maps');
const { DASHBOARD_DELETED } = require('../actions/dashboards');

const {set} = require('../utils/ImmutableUtils');

function dashboard(state = {}, action) {
    switch (action.type) {
    case ATTRIBUTE_UPDATED: {
        return set("latestResource", {
            resourceId: action.resourceId,
            // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
            [action.name]: decodeURIComponent(action.value)
        }, state);
    }
    case MAP_DELETED: {
        return set("latestResource", {
            resourceId: action.resourceId,
            deleted: true
        }, state);
    }
    case DASHBOARD_DELETED: {
        return set("latestResource", {
            resourceId: action.id,
            deleted: true
        }, state);
    }
    case MAP_METADATA_UPDATED: {
        return set("latestResource", {
            resourceId: action.resourceId,
            name: action.newName,
            description: action.newDescription
        }, state);
    }
    case PERMISSIONS_UPDATED: {
        return set("latestResource", {
            resourceId: action.resourceId,
            permission: 'updated'
        }, state);
    }
    case MAPS_LIST_LOADING: {
        return {...state,
            searchText: action.searchText
        };
    }
    case FEATURED_MAPS_SET_ENABLED: {
        return set("enabled", action.enabled, state);
    }
    case FEATURED_MAPS_SET_LATEST_RESOURCE: {
        return set("latestResource", action.resource, state);
    }
    default:
        return state;
    }
}
module.exports = dashboard;
