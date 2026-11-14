/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import {
    changeSpatialAttribute,
    SELECT_VIEWPORT_SPATIAL_METHOD,
    updateGeometrySpatialField
} from '../actions/queryform';

import { CHANGE_MAP_VIEW } from '../actions/map';

import {
    FEATURE_TYPE_SELECTED,
    QUERY,
    UPDATE_QUERY,
    featureLoading,
    featureTypeLoaded,
    featureTypeError,
    querySearchResponse,
    queryError,
    INIT_QUERY_PANEL
} from '../actions/wfsquery';

import { paginationInfo, isDescribeLoaded, layerDescribeSelector } from '../selectors/query';
import { mapSelector } from '../selectors/map';
import { authkeyParamNameSelector } from '../selectors/catalog';
import CoordinatesUtils from '../utils/CoordinatesUtils';
import { addTimeParameter } from '../utils/WFSTimeUtils';
import ConfigUtils from '../utils/ConfigUtils';

import {
    spatialFieldMethodSelector,
    spatialFieldSelector,
    spatialFieldGeomTypeSelector,
    spatialFieldGeomCoordSelector,
    spatialFieldGeomSelector,
    spatialFieldGeomProjSelector
} from '../selectors/queryform';

import { changeDrawingStatus } from '../actions/draw';
import * as notifications from '../actions/notifications';

import {selectedLayerSelector, useLayerFilterSelector} from '../selectors/featuregrid';
import {layerLoad} from '../actions/layers';

import { getFeatureSource, getFeatureSourceByType } from '../api/featuresource';
import { INVALID_JSON } from '../api/featuresource/wfs';

const sourceOf = (layer) => getFeatureSource(layer) ?? getFeatureSourceByType('wfs');

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

export const featureTypeSelectedEpic = (action$, store) =>
    action$.ofType(FEATURE_TYPE_SELECTED)
        // the url is optional, a source can carry its own data instead of describing it through a service
        .filter(action => !!action.typeName)
        .switchMap(action => {
            const state = store.getState();
            const selectedLayer = selectedLayerSelector(state);
            const source = sourceOf(selectedLayer);
            const toActions = (data, owner) => {
                const info = {...data, url: action.url};
                const geometry = info.geometry[0]?.attribute ?? 'the_geom';
                return [changeSpatialAttribute(geometry), featureTypeLoaded(action.typeName, info, owner)];
            };

            if (isDescribeLoaded(state, action.typeName, action.url)) {
                // async scheduler is needed to allow invokers of `FEATURE_TYPE_SELECTED` to intercept `FEATURE_TYPE_LOADED` action as response.
                const [spatialAttribute, loaded] = toActions(source.toInfo(layerDescribeSelector(state, action.typeName), action.fields), action.owner);
                return Rx.Observable.of(loaded, spatialAttribute, Rx.Scheduler.async);
            }

            return Rx.Observable.defer(() => source.describe(selectedLayer, {
                url: action.url,
                typeName: action.typeName,
                fields: action.fields,
                authkeyParamName: authkeyParamNameSelector(state)
            }))
                .switchMap((data) => Rx.Observable.from(toActions(data)))
                .catch(e => Rx.Observable.from([
                    featureTypeError(action.typeName, e.message || e.statusText),
                    ...(e.code === INVALID_JSON ? [notifications.error({
                        title: 'warning',
                        message: 'layerProperties.featureTypeErrorInvalidJSON',
                        autoDismiss: 3,
                        position: 'tc'
                    })] : [])
                ]));
        });

/**
 * Sends a WFS query composing filters from action, layerFilter and cql_filter, returns a response or handles request error
 * in particular the NoApplicableCode WFS error with a forced sort option on the first attribute
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `QUERY`
 * @return {external:Observable}
 */
export const wfsQueryEpic = (action$, store) =>
    action$.ofType(QUERY)
        .switchMap(action => {
            const defaultSortOptions = getDefaultSortOptions(getFirstAttribute(store.getState()));
            const sortOptions = action?.filterObj?.sortOptions || defaultSortOptions;
            const totalFeatures = paginationInfo.totalFeatures(store.getState());
            const searchUrl = ConfigUtils.filterUrlParams(action.searchUrl, authkeyParamNameSelector(store.getState()));
            const layer = selectedLayerSelector(store.getState());
            const { url, options: queryOptions } = addTimeParameter(searchUrl, action.queryOptions || {}, store.getState());
            const options = {
                ...action.filterObj.pagination,
                totalFeatures,
                sortOptions,
                ...queryOptions,
                url,
                featureTypeName: action.filterObj.featureTypeName,
                useLayerFilter: useLayerFilterSelector(store.getState())
            };

            // TODO refactor, the layer that should be used should be the used when the feature grid is opened from the toc, see #6430
            return Rx.Observable.merge(
                sourceOf(layer).getFeatures(layer, action.filterObj, options)
                    .map(data => querySearchResponse(data, action.searchUrl, action.filterObj, action.queryOptions, action.reason))
                    .catch(error => Rx.Observable.of(queryError(error)))
                    .startWith(featureLoading(true))
                    .concat(Rx.Observable.of(featureLoading(false)), Rx.Observable.of(layerLoad(layer?.id)))
            ).takeUntil(action$.ofType(UPDATE_QUERY));
        });

/**
 * Generate a spatial filter geometry from the view bounds
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `SELECT_VIEWPORT_SPATIAL_METHOD` and `CHANGE_MAP_VIEW`
 * @return {external:Observable}
 */

export const viewportSelectedEpic = (action$, store) =>
    action$.ofType(SELECT_VIEWPORT_SPATIAL_METHOD, CHANGE_MAP_VIEW)
        .switchMap((action) => {
            // calculate new geometry from map properties only for viewport
            const map = action.type === CHANGE_MAP_VIEW ? action : mapSelector(store.getState());
            if ((action.type === SELECT_VIEWPORT_SPATIAL_METHOD
            || action.type === CHANGE_MAP_VIEW && spatialFieldMethodSelector(store.getState()) === "Viewport")
            && map.bbox && map.bbox.bounds && map.bbox.crs) {
                const bounds = Object.keys(map.bbox.bounds).reduce((p, c) => {
                    return Object.assign({}, p, {[c]: parseFloat(map.bbox.bounds[c])});
                }, {});
                return Rx.Observable.of(updateGeometrySpatialField(CoordinatesUtils.getViewportGeometry(bounds, map.bbox.crs)));
            }
            return Rx.Observable.empty();
        });


export const redrawSpatialFilterEpic = (action$, store) =>
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


export default {
    featureTypeSelectedEpic,
    wfsQueryEpic,
    redrawSpatialFilterEpic,
    viewportSelectedEpic
};
