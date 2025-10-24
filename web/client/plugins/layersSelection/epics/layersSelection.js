import { Observable } from 'rxjs';
import axios from 'axios';
import assign from 'object-assign';

import { SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../../../actions/controls';
import { UPDATE_NODE, REMOVE_NODE } from '../../../actions/layers';
import { changeDrawingStatus, END_DRAWING } from '../../../actions/draw';
import { registerEventListener, unRegisterEventListener} from '../../../actions/map';
import { shutdownToolOnAnotherToolDrawing } from "../../../utils/ControlUtils";
import { describeFeatureType, getFeatureURL } from '../../../api/WFS';
import { extractGeometryAttributeName } from '../../../utils/WFSLayerUtils';
import { mergeOptionsByOwner, removeAdditionalLayer } from '../../../actions/additionallayers';
import { highlightStyleSelector } from '../../../selectors/mapInfo';
import { layersSelector, groupsSelector } from '../../../selectors/layers';
import { flattenArrayOfObjects, getInactiveNode } from '../../../utils/LayersUtils';

import { optionsToVendorParams } from '../../../utils/VendorParamsUtils';
import { selectLayersSelector, isSelectEnabled, filterLayerForSelect, isSelectQueriable, getSelectQueryMaxFeatureCount, getSelectHighlightOptions } from '../selectors/layersSelection';
import { SELECT_CLEAN_SELECTION, ADD_OR_UPDATE_SELECTION, addOrUpdateSelection } from '../actions/layersSelection';
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
                    params: assign({
                        f: "json",
                        geometry: parsedGeometry,
                        geometryType: geometryType,
                        spatialRel: "esriSpatialRelIntersects",
                        where: '1=1',
                        outFields: '*'
                    }, describe.data.advancedQueryCapabilities.supportsPagination && selectQueryMaxCount > -1 ? { resultRecordCount: selectQueryMaxCount } : {}
                    )})
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
        return describeFeatureType(layer.url, layer.name)
            .then(describe => axios
                .get(getFeatureURL(layer.url, layer.name,
                    optionsToVendorParams({
                        filterObj: {
                            spatialField: {
                                operation: "INTERSECTS",
                                attribute: extractGeometryAttributeName(describe),
                                geometry: geometry
                            }
                        }
                    })
                ), { params: assign({ outputFormat: 'application/json' },
                    selectQueryMaxCount > -1 ? {
                        maxFeatures: selectQueryMaxCount,   // WFS v1.1.0
                        count: selectQueryMaxCount
                    } : {}
                )})
                .then(response => assign(response.data, response.data.crs === null ? {} :
                    {
                        crs: {
                            type: response.data.crs.type,
                            properties: {...response.data.crs.properties, [response.data.crs.type]: makeCrsValid(response.data.crs.properties[response.data.crs.type])}
                        }
                    })
                )
                .catch(err => { throw new Error(`Error ${err.status}: ${err.statusText}`); })
            ).catch(err => { throw new Error(`Error ${err.status}: ${err.statusText}`); });
    }
    default:
        return new Promise((_, reject) => reject(new Error(`Unsupported layer type: ${layer.type}`)));
    }
};

/**
 * Epic triggered when the Select tool is opened.
 * Registers map click event and synchronizes visibility of additional layers.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const openSelectEpic = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(action => action.control === "select" && isSelectEnabled(store.getState()))
    .switchMap(() => Observable.merge(
        Observable.of(registerEventListener('click', 'select')),
        ...selectLayersSelector(store.getState()).map(layer => Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(layer.id), { visibility: layer.visibility })))
    ));

/**
 * Epic triggered when the Select tool is closed.
 * Unregisters map events and hides additional layers.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const closeSelectEpics = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
    .filter(action => action.control === "select" && !isSelectEnabled(store.getState()))
    .switchMap(() => Observable.merge(
        Observable.of(unRegisterEventListener('click', 'select')),
        Observable.of(changeDrawingStatus("clean", "", "select", [], {})),
        ...selectLayersSelector(store.getState()).map(layer => Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(layer.id), { visibility: false }))))
    );

/**
 * Shuts down the Select tool if another drawing tool is activated.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const tearDownSelectOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, 'select');

/**
 * Epic triggered at the end of a drawing session.
 * Queries layers with the drawn geometry and updates the selection.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const queryLayers = (action$, store) => action$
    .ofType(END_DRAWING)
    .filter(action =>
        action.owner === 'select' &&
        isSelectEnabled(store.getState()) &&
        action.geometry
    )
    .switchMap(action => {
        const state = store.getState();
        const selectQueryMaxCount = getSelectQueryMaxFeatureCount(state);
        return Observable.from(selectLayersSelector(state))
            .mergeMap(layer => Observable.concat(
                Observable.of(addOrUpdateSelection(layer, {})),
                isSelectQueriable(layer)
                    ? Observable.concat(
                        Observable.of(addOrUpdateSelection(layer, { loading: true })),
                        Observable.fromPromise(queryLayer(layer, action.geometry, selectQueryMaxCount))
                            .map(geoJsonData => addOrUpdateSelection(layer, geoJsonData))
                            .catch(error => Observable.of(addOrUpdateSelection(layer, { error })))
                    )
                    : Observable.empty()
            ));
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
    .filter(() => isSelectEnabled(store.getState()))
    .switchMap(action => Observable.merge(
        Observable.of(
            changeDrawingStatus(
                action.geomType ? "start" : "clean",
                action.geomType || "",
                "select",
                [],
                action.geomType ? {
                    stopAfterDrawing: true,
                    editEnabled: false,
                    drawEnabled: false
                } : {}
            )
        ),
        Observable.from(selectLayersSelector(store.getState())).flatMap(layer =>
            Observable.merge(
                Observable.of(addOrUpdateSelection(layer, {})),
                Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(layer.id), {
                    features: [],
                    visibility: false
                }))
            )
        )
    ));

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
            return Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(action.node), { visibility: action.options.visibility }));
        }

        const groups = flattenArrayOfObjects(groupsSelector(state));
        return Observable.from(layersForSelect.filter(layer => layer.group?.startsWith(action.node)))
            .mergeMap(layer => Observable.of(mergeOptionsByOwner(buildAdditionalLayerOwnerName(layer.id), { visibility: !getInactiveNode(layer.group, groups) }))
            );
    });

/**
 * Epic to remove associated additional layers when a source layer is removed.
 *
 * @param {Observable} action$ - Stream of Redux actions.
 * @param {Object} store - Redux store.
 * @returns {Observable} Epic stream.
 */
export const onRemoveLayer = (action$, store) => action$
    .ofType(REMOVE_NODE)
    .filter(action => isSelectEnabled(store.getState())
        && action.nodeType === 'layers'
    )
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
    .mergeMap(action => Observable.of(customUpdateAdditionalLayer(
        action.layer.id,
        action.geoJsonData.features ?? [],
        action.layer.visibility && action.geoJsonData.error && !action.geoJsonData.loading,
        { ...highlightStyleSelector(store.getState()), ...getSelectHighlightOptions(store.getState())}
    )));

export default {
    openSelectEpic,
    closeSelectEpics,
    tearDownSelectOnDrawToolActive,
    queryLayers,
    cleanSelection,
    synchroniseLayersAndAdditionalLayers,
    onRemoveLayer,
    onSelectionUpdate
};
