/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import axios from 'axios';
import { SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, TOGGLE_CONTROL, RESET_CONTROLS } from '../../../actions/controls';
import { UPDATE_NODE, REMOVE_NODE, browseData } from '../../../actions/layers';
import { registerEventListener, unRegisterEventListener} from '../../../actions/map';
import { purgeMapInfoResults, hideMapinfoMarker } from '../../../actions/mapInfo';
import { updateDockPanelsList, forceUpdateMapLayout } from '../../../actions/maplayout';
import { setLayer, storeAdvancedSearchFilter } from '../../../actions/featuregrid';
import { shutdownToolOnAnotherToolDrawing } from "../../../utils/ControlUtils";
import { describeFeatureType, getFeatureURL } from '../../../api/WFS';
import { extractGeometryAttributeName } from '../../../utils/WFSLayerUtils';
import { mergeOptionsByOwner, removeAdditionalLayer } from '../../../actions/additionallayers';
import { highlightStyleSelector } from '../../../selectors/mapInfo';
import { layersSelector, groupsSelector } from '../../../selectors/layers';
import { flattenArrayOfObjects, getInactiveNode, getSearchUrl, getWFSLayerName } from '../../../utils/LayersUtils';

import { optionsToVendorParams } from '../../../utils/VendorParamsUtils';
import { selectLayersSelector, isSelectEnabled, filterLayerForSelect, isSelectQueriable, getSelectQueryMaxFeatureCount, getSelectHighlightOptions, getSelectionFeature, getSelectSelections } from '../selectors/layersSelection';
import { SELECT_CLEAN_SELECTION, SELECT_STORE_CFG, ADD_OR_UPDATE_SELECTION, addOrUpdateSelection, UPDATE_SELECTION_FEATURE, cleanSelection as cleanSelectionAction, VIEW_SELECTION_IN_TABLE } from '../actions/layersSelection';
import { buildAdditionalLayerId, buildAdditionalLayerOwnerName, arcgisToGeoJSON, makeCrsValid, customUpdateAdditionalLayer } from '../utils/LayersSelection';

/**
 * Queries a given layer based on geometry and type (ArcGIS, WMS, or WFS).
 *
 * @param {Object} layer - Layer configuration object.
 * @param {Object} geometry - Geometry used for spatial filtering.
 * @param {number} selectQueryMaxCount - Max features to return.
 * @returns {Promise<Object>} A Promise resolving to a GeoJSON FeatureCollection.
 */
const queryLayer = (layer, geometry, selectQueryMaxCount) => {
    switch (layer.type) {
    case 'arcgis': {
        const parsedGeometry = JSON.stringify({
            spatialReference: { wkid: geometry.projection.split(':')[1] },
            ...(geometry.type === 'Point'
                ? { x: geometry.coordinates[0], y: geometry.coordinates[1] }
                : (geometry.type === 'LineString' ?
                    { 'paths': [geometry.coordinates] } :
                    { 'rings': geometry.coordinates }
                )
            )
        });
        const geometryType = geometry.type === 'Point' ? "esriGeometryPoint" : (geometry.type === 'LineString' ? 'esriGeometryPolyline' : 'esriGeometryPolygon');
        const singleLayerId = parseInt(layer.name ?? '', 10);
        return Promise.all((Number.isInteger(singleLayerId) ? layer.options.layers.filter(l => l.id === singleLayerId) : layer.options.layers).map(l => axios.get(`${layer.url}/${l.id}`, { params: { f: 'json'} })
            .then(describe =>
                axios.get(`${layer.url}/${l.id}/query`, {
                    params: {
                        f: "json",
                        geometry: parsedGeometry,
                        geometryType: geometryType,
                        spatialRel: "esriSpatialRelIntersects",
                        where: '1=1',
                        outFields: '*',
                        // output feature to EPSG:4326
                        // to make them visible on the vector layer
                        outSR: '4326',
                        ...(describe.data.advancedQueryCapabilities.supportsPagination && selectQueryMaxCount > -1 ? { resultRecordCount: selectQueryMaxCount } : {})
                    }})
                    .then(response => ({ features: arcgisToGeoJSON(response.data.features, describe.data.name, response.data.fields.find(field => field.type === 'esriFieldTypeOID')?.name ?? response.data.objectIdFieldName ?? 'objectid'), crs: makeCrsValid(describe.data.sourceSpatialReference.wkid.toString()) }))
                    .catch(err => { throw new Error(`Error while querying layer: ${err.message}`); })
            )))
            .then(responses => responses.reduce((acc, response) => {
                const features = [...acc.features, ...response.features];
                return {...acc, ...{
                    features: selectQueryMaxCount > -1 && features.length > selectQueryMaxCount ? features.slice(0, selectQueryMaxCount) : features,
                    totalFeatures: acc.totalFeatures + response.features.length,
                    numberMatched: acc.numberMatched + response.features.length,
                    numberReturned: acc.numberReturned + response.features.length
                }};
            }, {
                type: "FeatureCollection",
                features: [],
                totalFeatures: 0,
                numberMatched: 0,
                numberReturned: 0,
                timeStamp: new Date().toISOString(),
                crs: {
                    type: "name",
                    properties: {
                        name: makeCrsValid(responses[0].crs.toString())     // All layer crs in a MapServer/FeatureServer are the same
                    }
                }
            }))
            .catch(err => {
                throw new Error(`Error while querying layer: ${err.message}`);
            })
        ;
    }
    case 'wms':
    case 'wfs': {
        const url = getSearchUrl(layer);
        const typeName = getWFSLayerName(layer);
        return describeFeatureType(url, typeName)
            .then(describe =>
                axios.get(
                    getFeatureURL(
                        url, typeName,
                        optionsToVendorParams({
                            filterObj: {
                                spatialField: {
                                    operation: "INTERSECTS",
                                    attribute: extractGeometryAttributeName(describe),
                                    geometry: geometry
                                }
                            }
                        })
                    ),
                    { params: {
                        outputFormat: 'application/json',
                        // force srs to ensure the zoom to function will work
                        // without converting unsupported projections client side
                        srsName: 'EPSG:4326',
                        ...(selectQueryMaxCount > -1 ? {
                            maxFeatures: selectQueryMaxCount,   // WFS v1.1.0
                            count: selectQueryMaxCount
                        } : {})
                    }}
                )
                    .then(response => ({
                        ...response.data,
                        ...(response.data.crs === null ? {} :
                            {
                                crs: {
                                    type: response.data.crs.type,
                                    properties: {...response.data.crs.properties, [response.data.crs.type]: makeCrsValid(response.data.crs.properties[response.data.crs.type])}
                                }
                            })
                    }))
                    .catch(err => { throw new Error(`Error ${err.status}: ${err.statusText}`); })
            ).catch(err => { throw new Error(`Error ${err.status}: ${err.statusText}`); });
    }
    default:
        return new Promise((_, reject) => reject(new Error(`Unsupported layer type: ${layer.type}`)));
    }
};

/**
 * Epic triggered when the Select tool is opened.
 * Claims map clicks and registers the selection dock with the shared layout.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
const isSelectionControlAction = action => action.control === 'layersSelection'
    && (action.type === SET_CONTROL_PROPERTIES
        ? Object.hasOwn(action.properties, 'enabled')
        : !action.property || action.property === 'enabled');

export const openSelectEpic = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, TOGGLE_CONTROL)
    .filter(action => isSelectionControlAction(action) && isSelectEnabled(store.getState()))
    .switchMap(() => Observable.of(
        purgeMapInfoResults(),
        hideMapinfoMarker(),
        registerEventListener('click', 'layersSelection'),
        // Both panel modes remain exclusive with the tools using the right dock.
        updateDockPanelsList('layersSelection', 'add', 'right')
    ));

export const updateSelectionLayout = action$ => action$
    .ofType(SELECT_STORE_CFG)
    .mapTo(forceUpdateMapLayout());

/**
 * Epic triggered when the Select tool is closed.
 * Releases map clicks and clears drawing geometry and selection results.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const closeSelectEpics = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, TOGGLE_CONTROL, RESET_CONTROLS)
    .filter(action => (isSelectionControlAction(action) || action.type === RESET_CONTROLS)
        && !isSelectEnabled(store.getState()))
    .switchMap(() => Observable.of(
        unRegisterEventListener('click', 'layersSelection'),
        updateDockPanelsList('layersSelection', 'remove', 'right'),
        cleanSelectionAction(null)
    ));

/**
 * Shuts down the Select tool if another drawing tool is activated.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const tearDownSelectOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, 'layersSelection');

const querySelection = (action$, store, layer, geometry) => Observable.concat(
    Observable.of(addOrUpdateSelection(layer, { loading: true })),
    Observable.defer(() => queryLayer(layer, geometry, getSelectQueryMaxFeatureCount(store.getState())))
        .map(geoJsonData => addOrUpdateSelection(layer, geoJsonData))
        .catch(error => Observable.of(addOrUpdateSelection(layer, { error })))
).takeUntil(action$.filter(action => action.type === SELECT_CLEAN_SELECTION
    || action.type === UPDATE_SELECTION_FEATURE
    || !isSelectEnabled(store.getState())
    || (action.type === REMOVE_NODE && action.node === layer.id)
    || (action.type === UPDATE_NODE && action.node === layer.id
        && Object.hasOwn(action.options || {}, 'isSelectQueriable'))
));

/**
 * Epic triggered at the end of a drawing session.
 * Queries layers with the drawn geometry and updates the selection.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const queryLayers = (action$, store) => action$
    .ofType(UPDATE_SELECTION_FEATURE)
    .filter((action) => action?.feature?.geometry && isSelectEnabled(store.getState()))
    .switchMap(action => {
        const state = store.getState();
        return Observable.from(selectLayersSelector(state).filter(isSelectQueriable))
            .mergeMap(layer => querySelection(action$, store, layer, action.feature.geometry));
    });

export const updateSelectedLayer = (action$, store) => action$
    .ofType(UPDATE_NODE)
    .filter(action => isSelectEnabled(store.getState())
        && action.nodeType === 'layers'
        && Object.hasOwn(action.options || {}, 'isSelectQueriable'))
    .mergeMap(action => {
        const state = store.getState();
        const layer = selectLayersSelector(state).find(({ id }) => id === action.node);
        if (!layer) {
            return Observable.empty();
        }
        const geometry = getSelectionFeature(state)?.geometry;
        return isSelectQueriable(layer) && geometry
            ? querySelection(action$, store, layer, geometry)
            : Observable.of(addOrUpdateSelection(layer, {}), removeAdditionalLayer({ owner: buildAdditionalLayerOwnerName(layer.id) }));
    });

/**
 * Epic that handles cleaning of selection data and optionally restarts drawing.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const cleanSelection = (action$, store) => action$
    .ofType(SELECT_CLEAN_SELECTION)
    .switchMap(() => Observable.from(selectLayersSelector(store.getState()))
        .map(layer => removeAdditionalLayer({ owner: buildAdditionalLayerOwnerName(layer.id) })));

/**
 * Epic to synchronize visibility of layers and additional layers when their state changes.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const synchroniseLayersAndAdditionalLayers = (action$, store) => action$
    .filter(action => action.type === UPDATE_NODE
        && isSelectEnabled(store.getState())
        && Object.hasOwn(action.options || {}, 'visibility')
    )
    .concatMap(action => {
        const state = store.getState();
        const layersForSelect = layersSelector(state).filter(filterLayerForSelect);

        if (layersForSelect?.find(layer => layer.id === action.node)) {
            const layer = layersForSelect.find(({ id }) => id === action.node);
            return Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(action.node), { visibility: !!action.options.visibility && isSelectQueriable(layer) }));
        }

        const groups = flattenArrayOfObjects(groupsSelector(state));
        return Observable.from(layersForSelect.filter(layer => layer.group?.startsWith(action.node)))
            .mergeMap(layer => Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(layer.id), { visibility: layer.visibility && isSelectQueriable(layer) && !getInactiveNode(layer.group, groups) }))
            );
    });

/**
 * Epic to remove associated additional layers when a source layer is removed.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const onRemoveLayer = action$ => action$
    .ofType(REMOVE_NODE)
    .filter(action => action.nodeType === 'layers')
    .mergeMap(action => Observable.of(removeAdditionalLayer({ id: buildAdditionalLayerId(action.node), owner: buildAdditionalLayerOwnerName(action.node) })));

/**
 * Epic to update the map layer display with new selection results.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const onSelectionUpdate = (action$, store) => action$
    .ofType(ADD_OR_UPDATE_SELECTION)
    .filter(action => isSelectEnabled(store.getState()) && action.layer)
    .mergeMap(action => {
        const state = store.getState();
        const layer = selectLayersSelector(state).find(({ id }) => id === action.layer.id);
        return Observable.of(customUpdateAdditionalLayer(
            action.layer.id,
            action.geoJsonData.features ?? [],
            !!layer?.visibility && isSelectQueriable(layer) && !action.geoJsonData.error && !action.geoJsonData.loading,
            { ...highlightStyleSelector(state), ...getSelectHighlightOptions(state)}
        ));
    });

export const viewSelectionInTable = (action$, store) => action$
    .ofType(VIEW_SELECTION_IN_TABLE)
    .filter(({ layer }) => isSelectEnabled(store.getState()) && ['wms', 'wfs'].includes(layer.type))
    .switchMap(({ layer, primaryKey }) => {
        const state = store.getState();
        const features = getSelectSelections(state)[layer.id]?.features || [];
        const geometry = getSelectionFeature(state)?.geometry;
        if (!features.length || (!primaryKey && !geometry)) {
            return Observable.empty();
        }
        const url = getSearchUrl(layer);
        const name = getWFSLayerName(layer);
        return Observable.defer(() => describeFeatureType(url, name))
            .mergeMap(describe => Observable.of(
                setLayer(layer.id),
                storeAdvancedSearchFilter({
                    featureTypeName: name,
                    filterType: 'OGC',
                    ogcVersion: '1.1.0',
                    ...(primaryKey ? {
                        groupFields: [{ id: 1, logic: 'OR', index: 0 }],
                        filterFields: features.map((feature, index) => ({
                            rowId: index,
                            groupId: 1,
                            attribute: primaryKey,
                            operator: '=',
                            value: feature.properties[primaryKey],
                            type: typeof feature.properties[primaryKey] === 'number' ? 'number' : 'string'
                        }))
                    } : {
                        spatialField: {
                            operation: 'INTERSECTS',
                            attribute: extractGeometryAttributeName(describe),
                            geometry
                        }
                    })
                }),
                browseData(layer)
            ))
            .catch(error => Observable.of(addOrUpdateSelection(layer, { error })))
            .takeUntil(action$.filter(action => action.type === SELECT_CLEAN_SELECTION
                || action.type === UPDATE_SELECTION_FEATURE
                || !isSelectEnabled(store.getState())
                || (action.type === UPDATE_NODE && action.node === layer.id && action.options?.isSelectQueriable === false)
                || (action.type === REMOVE_NODE && action.node === layer.id)
            ));
    });

export default {
    openSelectEpic,
    updateSelectionLayout,
    closeSelectEpics,
    tearDownSelectOnDrawToolActive,
    queryLayers,
    updateSelectedLayer,
    cleanSelection,
    synchroniseLayersAndAdditionalLayers,
    onRemoveLayer,
    onSelectionUpdate,
    viewSelectionInTable
};
