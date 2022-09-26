/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from "url";
import {get, includes, inRange, isEmpty, isNaN, isNil, isObject, toNumber} from "lodash";

import {getBbox} from "./MapUtils";
import {isValidExtent} from "./CoordinatesUtils";
import {getCenter, getConfigProp} from "./ConfigUtils";
import {updatePointWithGeometricFilter} from "./IdentifyUtils";
import {mapProjectionSelector} from "./PrintUtils";
import {ADD_LAYERS_FROM_CATALOGS} from "../actions/catalog";
import {changeMapView, ZOOM_TO_EXTENT, zoomToExtent} from "../actions/map";
import {mapSelector} from "../selectors/map";
import {featureInfoClick} from "../actions/mapInfo";
import {warning} from "../actions/notifications";
import {addMarker, SEARCH_LAYER_WITH_FILTER} from "../actions/search";

/**
 * Retrieves parameters from hash "query string" of react router
 * Example: `#/viewer/openlayers/0?center=0,0&zoom=5
 * @param {string|number} name - name of the parameter to get
 * @param state - state of the app
 */
export const getRequestLoadValue = (name, state) => {
    const search = get(state, 'router.location.search') || '';
    const { query = {} } = url.parse(search, true) || {};
    if (query[name]) {
        try {
            return JSON.parse(query[name]);
        } catch (e) {
            if (query[name].length) {
                return query[name];
            }
            return null;
        }
    }
    return null;
};

/**
 * Retrieves parameters from the `queryParams` entry (JSON) of the passed storage (by default `sessionStorage`).
 * Example:
 * <pre>
 * {
 *      "map": {"Contents of exported map"},
 *      "featureinfo": {"lat": 0, "lng": 0, "filterNameList": []},
 *      "bbox": "-177.84667968750014,-1.8234225930143395,-9.096679687500114,61.700290838326204",
 *      "center": "0,0",
 *      "zoom": 5,
 *      "actions": [],
 *      "page": "#/viewer/openlayers/config"
 * }
 * </pre>
 * @param {string} name - name of the parameter to get
 * @param queryParamsID - unique identifier of the request
 * @param {Storage} storage - sessionStorage or localStorage
 */
export const postRequestLoadValue = (name, queryParamsID, storage = sessionStorage) => {
    const itemName = queryParamsID ? `queryParams-${queryParamsID}` : 'queryParams';
    const queryParams = storage.getItem(itemName) ?? null;
    if (queryParams) {
        try {
            const params = JSON.parse(queryParams);
            const { [name]: item, ...rest } = params;
            if (item && typeof params === 'object') {
                const { length } = Object.keys(params);
                length > 1 && storage.setItem(itemName, JSON.stringify(rest));
                length === 1 && storage.removeItem(itemName);
            }
            return item;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Unable to parse query parameters from sessionStorage`);
            storage.removeItem(itemName);
            return null;
        }
    }
    return null;
};


/**
 * Retrieves parameter from two available sources:
 * - from hash "query string" of react router
 * - from the `queryParams` entry (JSON) of the passed storage
 * Data from query string has higher priority if parameter is available in both sources.
 * @param {string} name - name of the parameter to get
 * @param {*} state - app state
 * @param {Storage} storage - sessionStorage or localStorage
 */
export const getRequestParameterValue = (name, state, storage = sessionStorage) => {
    // Check if `queryParamsID` passed in query parameters. If so, use it as a key to retrieve data for POST method
    return getRequestLoadValue(name, state) ?? postRequestLoadValue(name, getRequestLoadValue('queryParamsID', state), storage);
};


/**
 * Map a set of URL querystrings to a KVP object
 * where each is single key is the parameter and the value is the parameter value
 * mapping is based on an object that maps each query string param to a redux action
 * @param {object} paramActions objects that maps each parameter to its respective action to trigger
 * @param {object} state the application state
 * @returns {object} { param: value } KVP object
 */
export const getParametersValues = (paramActions, state) => (
    Object.keys(paramActions)
        .reduce((params, parameter) => {
            const value = getRequestParameterValue(parameter, state, sessionStorage);
            return {
                ...params,
                ...(!isNil(value) ? { [parameter]: value } : {})
            };
        }, {})
);

/**
 * On a basis of a {param: action} object
 * map a KVP object in the form of {param: value}
 * to an array actions, each one corresponding to a param
 * @param {object} parameters objects that maps each parameter to its respective value
 * @param {object} paramActions objects that maps each parameter to its respective action to trigger
 * @param {object} state the application state
 * @returns {Function[]} array containing the functions to be triggered
 */
export const getQueryActions = (parameters, paramActions, state) => (
    Object.keys(parameters)
        .reduce((actions, param) => {
            return [
                ...actions,
                ...(paramActions[param](parameters, state) || [])
            ];
        }, [])
);

/**
 * From querystring params gets the specific cesium maps params (heading, pitch, roll)
 * and output and object with the param as key and the param value as object value
 * @param {String} parameters the querystring params from the URL request
 * @param {Object} map the slice of state having information about the current map
 * @returns {Object} the specific cesium map params in form of KVP object
 */
export const getCesiumViewerOptions = (parameters, map) => {
    const { heading, pitch, roll = 0 } = parameters;
    const validViewerOptions = [heading, pitch].map(val => typeof(val) !== 'undefined');
    return validViewerOptions && validViewerOptions.indexOf(false) === -1 ? {heading, pitch, roll} : map && map.viewerOptions;
};

/*
it maps params key to function.
functions must return an array of actions or and empty array
*/
export const paramActions = {
    bbox: (parameters) => {
        const extent = parameters.bbox.split(',')
            .map(val => parseFloat(val))
            .filter((val, idx) => idx % 2 === 0
                ? val > -180.5 && val < 180.5
                : val >= -90 && val <= 90)
            .filter(val => !isNaN(val));
        if (extent && extent.length === 4 && isValidExtent(extent)) {
            return [
                zoomToExtent(extent, 'EPSG:4326', undefined, {nearest: true})
            ];
        }
        return [
            warning({
                title: "share.wrongBboxParamTitle",
                message: "share.wrongBboxParamMessage",
                position: "tc"
            })
        ];
    },
    center: (parameters, state) => {
        const map = mapSelector(state);
        const validCenter = parameters && !isEmpty(parameters.center) && parameters.center.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = validCenter && validCenter.indexOf(false) === -1 && getCenter(validCenter);
        const zoom = toNumber(parameters.zoom);
        const bbox = getBbox(center, zoom);
        const mapSize = map && map.size;
        const projection = map && map.projection;
        const viewerOptions = getCesiumViewerOptions(parameters, map);
        const isValid = center && isObject(center) && inRange(center.y, -90, 91) && inRange(center.x, -180, 181) && inRange(zoom, 1, 36);
        if (isValid) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection, viewerOptions)];
        }
        return [
            warning({
                title: "share.wrongCenterAndZoomParamTitle",
                message: "share.wrongCenterAndZoomParamMessage",
                position: "tc"
            })
        ];
    },
    marker: (parameters, state) => {
        const map = mapSelector(state);
        const marker = !isEmpty(parameters.marker) && parameters.marker.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = marker && marker.length === 2 && marker.indexOf(false) === -1 && getCenter(marker);
        const zoom = toNumber(parameters.zoom);
        const bbox = getBbox(center, zoom);
        const lng = marker && marker[0];
        const lat = marker && marker[1];
        const mapSize = map && map.size;
        const projection = map && map.projection;
        const isValid = center && marker && isObject(marker) && (inRange(lat, -90, 91) && inRange(lng, -180, 181)) && inRange(zoom, 1, 36);

        if (isValid) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection),
                addMarker({lat, lng})
            ];
        }
        return [
            warning({
                title: "share.wrongMarkerAndZoomParamTitle",
                message: "share.wrongMarkerAndZoomParamMessage",
                position: "tc"
            })
        ];
    },
    featureinfo: (parameters, state) => {
        const value = parameters.featureinfo;
        const {lat, lng, filterNameList} = value;
        if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
            const projection = mapProjectionSelector(state);
            return [featureInfoClick(updatePointWithGeometricFilter({
                latlng: {
                    lat,
                    lng
                }
            }, projection), false, filterNameList ?? [])];
        }
        return [];
    },
    zoom: () => {
    },
    heading: () => {
    },
    pitch: () => {
    },
    roll: () => {
    }, // roll is currently not supported, we return standard 0 roll
    actions: (parameters) => {
        const whiteList = (getConfigProp("initialActionsWhiteList") || []).concat([
            SEARCH_LAYER_WITH_FILTER,
            ZOOM_TO_EXTENT,
            ADD_LAYERS_FROM_CATALOGS
        ]);
        if (parameters.actions) {
            return parameters.actions.filter(a => includes(whiteList, a.type));
        }
        return [];
    }
};
