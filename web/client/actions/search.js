/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
export const SEARCH_LAYER_WITH_FILTER = 'SEARCH:SEARCH_WITH_FILTER';
export const TEXT_SEARCH_STARTED = 'TEXT_SEARCH_STARTED';
export const TEXT_SEARCH_RESULTS_LOADED = 'TEXT_SEARCH_RESULTS_LOADED';
export const TEXT_SEARCH_PERFORMED = 'TEXT_SEARCH_PERFORMED';
export const TEXT_SEARCH_RESULTS_PURGE = 'TEXT_SEARCH_RESULTS_PURGE';
export const TEXT_SEARCH_RESET = 'TEXT_SEARCH_RESET';
export const TEXT_SEARCH_ADD_MARKER = 'TEXT_SEARCH_ADD_MARKER';
export const TEXT_SEARCH_TEXT_CHANGE = 'TEXT_SEARCH_TEXT_CHANGE';
export const TEXT_SEARCH_LOADING = 'TEXT_SEARCH_LOADING';
export const TEXT_SEARCH_NESTED_SERVICES_SELECTED = 'TEXT_SEARCH_NESTED_SERVICE_SELECTED';
export const TEXT_SEARCH_ERROR = 'TEXT_SEARCH_ERROR';
export const TEXT_SEARCH_CANCEL_ITEM = 'TEXT_SEARCH_CANCEL_ITEM';
export const TEXT_SEARCH_ITEM_SELECTED = 'TEXT_SEARCH_ITEM_SELECTED';
export const TEXT_SEARCH_SHOW_GFI = 'TEXT_SEARCH_SHOW_GFI';
export const TEXT_SEARCH_SET_HIGHLIGHTED_FEATURE = 'TEXT_SEARCH_SET_HIGHLIGHTED_FEATURE';
export const UPDATE_RESULTS_STYLE = 'UPDATE_RESULTS_STYLE';
export const CHANGE_SEARCH_TOOL = 'CHANGE_SEARCH_TOOL';
export const ZOOM_ADD_POINT = 'SEARCH:ZOOM_ADD_POINT';
export const CHANGE_FORMAT = 'SEARCH:CHANGE_FORMAT';
export const CHANGE_COORD = 'SEARCH:CHANGE_COORD';

/**
 * change the format for coordinate editor tool
 * @memberof actions.search
 * @param {string} format (decimal or aeronautical)
*/
export function changeFormat(format) {
    return {
        type: CHANGE_FORMAT,
        format
    };
}
/**
 * used to trigger two wfs requests GetFeature and then GetFeatureInfo
 * @memberof actions.search
 * @prop {object} options {layer, cql_filter}
 * @prop {string} options.cql_filter optional filter to apply for both requests
 * @prop {string} options.layer name of the layer with workspace
*/
// eslint-disable-next-line camelcase
export function searchLayerWithFilter({layer, cql_filter} = {}) {
    return {
        type: SEARCH_LAYER_WITH_FILTER,
        layer,
        cql_filter: cql_filter
    };
}
/**
 * zoom to a specific point
 * @memberof actions.search
 * @param {object} pos as array [x, y] or object {x: ..., y:...}
 * @param {number} zoom level to zoom to
 * @param {string} crs of the point
*/
export function zoomAndAddPoint(pos, zoom, crs) {
    return {
        type: ZOOM_ADD_POINT,
        pos,
        zoom,
        crs
    };
}

/**
 * updates the active menu
 * @memberof actions.search
 * @param {string} activeSearchTool services intrested to use for the next search
 */
export function changeActiveSearchTool(activeSearchTool) {
    return {
        type: CHANGE_SEARCH_TOOL,
        activeSearchTool
    };
}

/**
 * updates the results of the search result loaded
 * @memberof actions.search
 * @param {geojsonFeature[]} results array of search results
 * @param {boolean} append [false] tells to append the result to existing ones or not
 * @param {object[]} servies services intrested to use for the next search
 */
export function searchResultLoaded(results, append = false, services) {
    return {
        type: TEXT_SEARCH_RESULTS_LOADED,
        results: results,
        append: append,
        services
    };
}
/**
 * updates the search text
 * @memberof actions.search
 * @param {string} text the new text
 */
export function searchTextChanged(text) {
    return {
        type: TEXT_SEARCH_TEXT_CHANGE,
        searchText: text
    };
}
/**
 * trigger search text loading
 * @memberof actions.search
 * @param {boolean} loading boolean flag
 */
export function searchTextLoading(loading) {
    return {
        type: TEXT_SEARCH_LOADING,
        loading
    };
}

/**
 * an error occurred during text searchText
 * @memberof actions.search
 * @param error the error
 */
export function searchResultError(error) {
    return {
        type: TEXT_SEARCH_ERROR,
        error
    };
}

/**
 * clear the results
 * @memberof actions.search
 */
export function resultsPurge() {
    return {
        type: TEXT_SEARCH_RESULTS_PURGE
    };
}

/**
 * reset the search text and clear results
 * @memberof actions.search
 */
export function resetSearch() {
    return {
        type: TEXT_SEARCH_RESET
    };
}

/**
 * add a marker to the search result layer
 * @memberof actions.search
 * @param {object} itemPosition
 */
export function addMarker(itemPosition, itemText) {
    return {
        type: TEXT_SEARCH_ADD_MARKER,
        markerPosition: itemPosition,
        markerLabel: itemText
    };
}

/**
 * perform a text search
 * @memberof actions.search
 * @param {string} searchText the text to search
 * @param {object} [options={}] - the search options. Contain the services
 * @param {number} [maxResults=15] - the max results obtained from all the services
 */
export function textSearch(searchText, {services = null} = {}, maxResults = 15) {
    return {
        type: TEXT_SEARCH_STARTED,
        searchText,
        services,
        maxResults
    };
}

/**
 * Trigger when an item is selected from the search results
 * @memberof actions.search
 * @param {object} item the selected item
 * @param {object} mapConfig the current map configuration (with size, projection...)
 * @param {object} resultsStyle style to apply to results geometries
 */
export function selectSearchItem(item, mapConfig, resultsStyle) {
    return {
        type: TEXT_SEARCH_ITEM_SELECTED,
        item,
        mapConfig,
        resultsStyle
    };

}

/**
 * Triggers zoomToExtent and GFI panel for an item
 * @param {object} item target item
 */
export const showGFI = (item) => ({
    type: TEXT_SEARCH_SHOW_GFI,
    item
});

/**
 * Configures the search tool to perform sub-service queries. It will store the
 * selected item and configure the new nested services.
 * @memberof actions.search
 * @param {object[]} services the of the nested services
 * @param {object[]} items the selected items
 * @param {object[]} searchText the new search text
 */
export function selectNestedService(services, items, searchText) {
    return {
        type: TEXT_SEARCH_NESTED_SERVICES_SELECTED,
        searchText,
        services,
        items
    };
}

/**
 * remove an item selected ()
 * @memberof actions.search
 * @param {object} item the item to remove
 */
export function cancelSelectedItem(item) {
    return {
        type: TEXT_SEARCH_CANCEL_ITEM,
        item
    };
}

/**
 * Highlights the given feature
 * @memberof actions.search
 * @param {object} feature the feature to highlight
 */
export function setHighlightedFeature(feature) {
    return {
        type: TEXT_SEARCH_SET_HIGHLIGHTED_FEATURE,
        highlightedFeature: feature
    };
}

/**
 * Change default style of results geometries
 * @memberof actions.search
 * @param {object} style style of results geometries
 */
export function updateResultsStyle(style) {
    return {
        type: UPDATE_RESULTS_STYLE,
        style
    };
}

/**
 * Change coordinate
 * @memberof actions.search
 * @param {object} coordinate
 */
export function changeCoord(coord, val) {
    return {
        type: CHANGE_COORD,
        coord,
        val
    };
}

/**
 * Actions for search
 * @name actions.search
*/

import {error} from './notifications';

/**
 * error for non queriable layer
*/
export function nonQueriableLayerError() {
    return error({
        title: "Error",
        position: "tc",
        message: "search.errors.nonQueriableLayers",
        autoDismiss: 10
    });
}
/**
 * server error notification
*/
export function serverError() {
    return error({
        title: "Error",
        position: "tc",
        message: "search.errors.serverError",
        autoDismiss: 10
    });
}
