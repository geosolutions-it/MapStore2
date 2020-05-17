/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const axios = require('../libs/ajax');

const {changeSpatialAttribute, SELECT_VIEWPORT_SPATIAL_METHOD, updateGeometrySpatialField} = require('../actions/queryform');
const {CHANGE_MAP_VIEW} = require('../actions/map');
const {FEATURE_TYPE_SELECTED, QUERY, UPDATE_QUERY, featureLoading, featureTypeLoaded, featureTypeError, querySearchResponse, queryError} = require('../actions/wfsquery');
const {paginationInfo, isDescribeLoaded, layerDescribeSelector} = require('../selectors/query');
const {mapSelector} = require('../selectors/map');
const {authkeyParamNameSelector} = require('../selectors/catalog');
const {getSelectedLayer} = require('../selectors/layers');

const CoordinatesUtils = require('../utils/CoordinatesUtils');
const { addTimeParameter } = require('../utils/WFSTimeUtils');


const ConfigUtils = require('../utils/ConfigUtils');
const assign = require('object-assign');
const {spatialFieldMethodSelector, spatialFieldSelector, spatialFieldGeomTypeSelector, spatialFieldGeomCoordSelector, spatialFieldGeomSelector, spatialFieldGeomProjSelector} = require('../selectors/queryform');
const {changeDrawingStatus} = require('../actions/draw');
const {INIT_QUERY_PANEL} = require('../actions/wfsquery');
const {getJSONFeatureWA, getLayerJSONFeature} = require('../observables/wfs');
const {describeFeatureTypeToAttributes} = require('../utils/FeatureTypeUtils');
const notifications = require('../actions/notifications');

const {find} = require("lodash");

const FilterUtils = require('../utils/FilterUtils');
const filterBuilder = require('../utils/ogc/Filter/FilterBuilder');
const fromObject = require('../utils/ogc/Filter/fromObject');
const { read } = require('../utils/ogc/Filter/CQL/parser');

const fb = filterBuilder({ gmlVersion: "3.1.1" });
const toFilter = fromObject(fb);
const {filter, and} = fb;

const extractInfo = (data) => {
    return {
        geometry: data.featureTypes[0].properties
            .filter((attribute) => attribute.type.indexOf('gml:') === 0)
            .map((attribute) => {
                let conf = {
                    label: attribute.name,
                    attribute: attribute.name,
                    type: 'geometry',
                    valueId: "id",
                    valueLabel: "name",
                    values: []
                };
                return conf;
            }),
        original: data,
        attributes: describeFeatureTypeToAttributes(data)
    };
};

const getFirstAttribute = (state)=> {
    return state.query && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes && state.query.featureTypes[state.query.typeName].attributes[0] && state.query.featureTypes[state.query.typeName].attributes[0].attribute || null;
};

const getDefaultSortOptions = (attribute) => {
    return attribute ? { sortBy: attribute, sortOrder: 'A'} : {};
};

/**
 * Gets the WFS feature type attributes and geometry when the feature has been selected
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `FEATURE_TYPE_SELECTED`
 * @return {external:Observable}
 */

const featureTypeSelectedEpic = (action$, store) =>
    action$.ofType(FEATURE_TYPE_SELECTED)
        .filter(action => action.url && action.typeName)
        .switchMap(action => {
            const state = store.getState();
            if (isDescribeLoaded(state, action.typeName)) {
                const info = extractInfo(layerDescribeSelector(state, action.typeName));
                const geometry = info.geometry[0] && info.geometry[0].attribute ? info.geometry[0].attribute : 'the_geom';
                return Rx.Observable.of(changeSpatialAttribute(geometry));
            }
            return Rx.Observable.defer( () => axios.get(ConfigUtils.filterUrlParams(action.url, authkeyParamNameSelector(store.getState())) + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + action.typeName + '&outputFormat=application/json'))
                .map((response) => {
                    if (typeof response.data === 'object' && response.data.featureTypes && response.data.featureTypes[0]) {
                        const info = extractInfo(response.data);
                        const geometry = info.geometry[0] && info.geometry[0].attribute ? info.geometry[0].attribute : 'the_geom';
                        return Rx.Observable.from([changeSpatialAttribute(geometry), featureTypeLoaded(action.typeName, info)]);
                    }
                    try {
                        JSON.parse(response.data);
                    } catch (e) {
                        return Rx.Observable.from([
                            featureTypeError(action.typeName, 'Error from WFS: ' + e.message),
                            notifications.error({
                                title: 'warning',
                                message: 'layerProperties.featureTypeErrorInvalidJSON',
                                autoDismiss: 3,
                                position: 'tc'
                            })
                        ]);
                    }
                    return Rx.Observable.from([featureTypeError(action.typeName, 'Error: feature types are empty')]);
                })
                .mergeAll()
                .catch(e => Rx.Observable.of(featureTypeError(action.typeName, e.message || e.statusText)));
        });

/**
 * Sends a WFS query composing filters from action, layerFilter and cql_filter, returns a response or handles request error
 * in particular the NoApplicableCode WFS error with a forced sort option on the first attribute
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `QUERY`
 * @return {external:Observable}
 */
const wfsQueryEpic = (action$, store) =>
    action$.ofType(QUERY)
        .switchMap(action => {
            const sortOptions = getDefaultSortOptions(getFirstAttribute(store.getState()));
            const totalFeatures = paginationInfo.totalFeatures(store.getState());
            const searchUrl = ConfigUtils.filterUrlParams(action.searchUrl, authkeyParamNameSelector(store.getState()));
            // getSelected Layer and merge layerFilter and cql_filter in params  with action filter
            const layer = getSelectedLayer(store.getState()) || {};
            const {layerFilter, params} = layer;
            const cqlFilter = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter");
            const cqlFilterRules = cqlFilter
                ? [toFilter(read(cqlFilter))]
                : [];

            const filterObj = (cqlFilterRules.length > 0 || (FilterUtils.isFilterValid(layerFilter) && !layerFilter.disabled)) && filter(and(
                ...cqlFilterRules,
                ...(FilterUtils.isFilterValid(layerFilter) && !layerFilter.disabled ? FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                ...(FilterUtils.isFilterValid(action.filterObj) ? FilterUtils.toOGCFilterParts(action.filterObj, "1.1.0", "ogc") : [])))
                || action.filterObj;
            const { url: queryUrl, options: queryOptions } = addTimeParameter(searchUrl, action.queryOptions || {}, store.getState());
            const options = {
                ...action.filterObj.pagination,
                totalFeatures,
                sortOptions,
                ...queryOptions
            };
            return Rx.Observable.merge(
                (typeof filterObj === 'object' && getJSONFeatureWA(queryUrl, filterObj, options) || getLayerJSONFeature(layer, filterObj, options))
                    .map(data => querySearchResponse(data, action.searchUrl, action.filterObj, action.queryOptions, action.reason))
                    .catch(error => Rx.Observable.of(queryError(error)))
                    .startWith(featureLoading(true))
                    .concat(Rx.Observable.of(featureLoading(false)))
            ).takeUntil(action$.ofType(UPDATE_QUERY));
        });

/**
 * Generate a spatial filter geometry from the view bounds
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `SELECT_VIEWPORT_SPATIAL_METHOD` and `CHANGE_MAP_VIEW`
 * @return {external:Observable}
 */

const viewportSelectedEpic = (action$, store) =>
    action$.ofType(SELECT_VIEWPORT_SPATIAL_METHOD, CHANGE_MAP_VIEW)
        .switchMap((action) => {
            // calculate new geometry from map properties only for viewport
            const map = action.type === CHANGE_MAP_VIEW ? action : mapSelector(store.getState());
            if ((action.type === SELECT_VIEWPORT_SPATIAL_METHOD
            || action.type === CHANGE_MAP_VIEW && spatialFieldMethodSelector(store.getState()) === "Viewport")
            && map.bbox && map.bbox.bounds && map.bbox.crs) {
                const bounds = Object.keys(map.bbox.bounds).reduce((p, c) => {
                    return assign({}, p, {[c]: parseFloat(map.bbox.bounds[c])});
                }, {});
                return Rx.Observable.of(updateGeometrySpatialField(CoordinatesUtils.getViewportGeometry(bounds, map.bbox.crs)));
            }
            return Rx.Observable.empty();
        });


const redrawSpatialFilterEpic = (action$, store) =>
    action$.ofType(INIT_QUERY_PANEL)
        .switchMap(() => {
            const state = store.getState();
            const spatialField = spatialFieldSelector(state);
            const feature = {
                type: "Feature",
                geometry: {
                    type: spatialFieldGeomTypeSelector(state),
                    coordinates: spatialFieldGeomCoordSelector(state)
                }
            };
            let drawSpatialFilter = spatialFieldGeomSelector(state) ?
                changeDrawingStatus("drawOrEdit", spatialField.method || '', "queryform", [feature], {featureProjection: spatialFieldGeomProjSelector(state), drawEnabled: false, editEnabled: false}) :
                changeDrawingStatus("clean", spatialField.method || '', "queryform", [], {drawEnabled: false, editEnabled: false});
            // if a geometry is present it will redraw the spatial field
            return Rx.Observable.of(drawSpatialFilter);
        });


/**
  * Epics for WFS query requests
  * @name epics.wfsquery
  * @type {Object}
  */


module.exports = {
    featureTypeSelectedEpic,
    wfsQueryEpic,
    redrawSpatialFilterEpic,
    viewportSelectedEpic
};
