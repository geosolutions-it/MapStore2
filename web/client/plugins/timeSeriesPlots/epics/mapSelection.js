/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import uuid from 'uuid';
import moment from 'moment';

import {
    END_DRAWING,
    changeDrawingStatus
} from '@mapstore/actions/draw';

import { getLayerFromName } from '@mapstore/selectors/layers';
import { projectionSelector } from '@mapstore/selectors/map';
import { getLayerJSONFeature } from '@mapstore/observables/wfs';
import { CONTROL_NAME, MOUSEMOVE_EVENT, SELECTION_TYPES, TIME_SERIES_SELECTIONS_LAYER} from '../constants';
import FilterBuilder from '@mapstore/utils/ogc/Filter/FilterBuilder';
import { generateRandomHexColor } from '@mapstore/utils/ColorUtils';
import { wpsAggregateToChartData } from '@mapstore/components/widgets/enhancers/wpsChart';
import { wfsToChartData } from '@mapstore/components/widgets/enhancers/wfsChart';
import wpsAggregate from '@mapstore/observables/wps/aggregate';
import { selectedCatalogSelector } from '@mapstore/selectors/catalog';
import {
    timePlotDataSelector,
    timeSeriesLayersSelector,
    timeSeriesFeaturesSelectionsSelector,
    getTimeSeriesLayerByName,
    currentSelectionToolSelector,
    currentTraceColorsSelector
} from '../selectors/timeSeriesPlots';
import { TIME_SERIES_PLOTS } from '@mapstore/actions/layers';
import { CLICK_ON_MAP, MOUSE_MOVE, MOUSE_OUT, changeMousePointer, registerEventListener, unRegisterEventListener } from '@mapstore/actions/map';
import { featureInfoClick, purgeMapInfoResults, FEATURE_INFO_CLICK, LOAD_FEATURE_INFO, loadFeatureInfo, newMapInfoRequest, exceptionsFeatureInfo, errorFeatureInfo } from '@mapstore/actions/mapInfo';
import { updatePointWithGeometricFilter } from '@mapstore/epics/identify';
import { cancelSelectedItem } from '@mapstore/actions/search';
import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { 
    setCurrentFeaturesSelectionIndex,
    CHANGE_AGGREGATE_FUNCTION,
    storeTimeSeriesFeaturesIds,
    storeTimeSeriesChartData,
    updateTimeSeriesChartData,
    STORE_TIME_SERIES_FEATURES_IDS,
    TEAR_DOWN, TOGGLE_SELECTION,
    STORE_TIME_SERIES_CHART_DATA,
    REMOVE_TABLE_SELECTION_ROW,
    CHANGE_TRACE_COLOR, 
    CLEAR_ALL_SELECTIONS,
    SETUP
} from '../actions/timeSeriesPlots';
import { isMapPopup, isHighlightEnabledSelector, itemIdSelector, overrideParamsSelector, identifyOptionsSelector } from '@mapstore/selectors/mapInfo';
import {addPopup, cleanPopups, removePopup, REMOVE_MAP_POPUP} from '@mapstore/actions/mapPopups';
import { IDENTIFY_POPUP } from '@mapstore/components/map/popups';
import { localizedLayerStylesEnvSelector } from '@mapstore/selectors/localizedLayerStyles';
import { buildIdentifyRequest, filterRequestParams } from '@mapstore/utils/MapInfoUtils';
import { getFeatureInfo } from '@mapstore/api/identify';
import {getMessageById} from '@mapstore/utils/LocaleUtils';
import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
import { reprojectGeoJson } from '@mapstore/utils/CoordinatesUtils';
import { pointToFeature } from '../utils';

const CLEAN_ACTION = changeDrawingStatus("clean");
const DEACTIVATE_ACTIONS = [
    CLEAN_ACTION,
    changeDrawingStatus("stop"),
    registerEventListener(MOUSEMOVE_EVENT, CONTROL_NAME),
    changeMousePointer('auto')
];
const deactivate = () => Rx.Observable.from(DEACTIVATE_ACTIONS);

/**
 * Extract the drawMethod for DrawSupport from the method
 * @param {string} selection the current tool selected
 */
 const drawMethod = (selection) => {
    switch (selection) {
    case SELECTION_TYPES.CIRCLE:
        return "Circle";
    case SELECTION_TYPES.POINT:
        return "Point";
    case SELECTION_TYPES.POLYGON:
        return "Polygon";
    default:
        return null;
    }
}

const createRequest = (geometry, layer) =>  {
    const request = getLayerJSONFeature(layer, {
        filterType: "OGC", // CQL doesn't support LineString yet
        featureTypeName: layer?.search?.name ?? layer?.name,
        typeName: layer?.search?.name ?? layer?.name, // the layer name is not used
        ogcVersion: '1.1.0',
        spatialField: {
            attribute: "geom", // TODO: get the geom attribute from config
            geometry,
            operation: "INTERSECTS"
        }
    });
    return request;
}

const getTimeSeriesFeatures = (geometry, getState, timeSeriesLayerName) => {
    const timeSeriesLayer = getLayerFromName(getState(), timeSeriesLayerName);
    return createRequest(geometry, timeSeriesLayer)
    .map( ({features = [], ...rest} = {}) => {
        return {
            ...rest,
            features
        }
    });
};

const getWFSChartData = (layer, filter, options, aggregationAttribute, selectionId, selectionGeometry, getState, layerName, featuresIds) => {
    return getLayerJSONFeature(layer, filter)
    .filter(wfsQueryResults => wfsQueryResults.features.length)
    .map(wfsQueryResults => wfsToChartData(wfsQueryResults, options))
    .map(chartDataResults => {
        const parsedChartDataResults = chartDataResults.reduce((acc, cur) => {
        const parsedDate = moment(cur.DATE.replace('F', ''), "YYYYMMDD").toDate();
        return [
                ...acc, {
                    ...cur,
                    PARSED_DATE: parsedDate,
                    DATE: moment(parsedDate).format('YYYY-MM-DD')
                }
            ]
        }, []);
        parsedChartDataResults.sort((a,b) => a.PARSED_DATE - b.PARSED_DATE);
        const selectionType = currentSelectionToolSelector(getState());
        const currentTraceColors = currentTraceColorsSelector(getState());
        const selectionName = 'Point';
        const aggregateFunctionLabel = 'No Operation';
        const aggregateFunctionOption = { value: '', label: '' };
        const traceColor = generateRandomHexColor(currentTraceColors);
        const { groupByAttributes } = options;
        return storeTimeSeriesChartData(
            selectionId,
            selectionGeometry,
            selectionName,
            selectionType,
            aggregateFunctionLabel,
            aggregateFunctionOption,
            aggregationAttribute,
            groupByAttributes,
            layerName,
            featuresIds,
            parsedChartDataResults,
            traceColor
        );
    })
};

const getWPSChartData = (
    actionType,
    wpsUrl,
    options,
    selectionId,
    selectionGeometry,
    layerName,
    getState,
    featuresIds, 
    aggregateFunctionLabel = 'AVG',
    /** review this string, how to make it transaltable*/
    aggregateFunctionOption = { value: "Average", label: 'AVG'}
) => {
    return wpsAggregate(wpsUrl, options, {
        timeout: 15000, 
        headers: {'Content-Type': 'application/json'},
    })
    .map(aggregationResults => {
        const { aggregateFunction, aggregationAttribute, groupByAttributes} = options;
        return wpsAggregateToChartData(aggregationResults, [groupByAttributes], [aggregationAttribute], [aggregateFunction]);
    })
    .map(chartDataResults => {
        const parsedChartDataResults = chartDataResults.reduce((acc, cur) => {
        const parsedDate = moment(cur.DATE.replace('F', ''), "YYYYMMDD").toDate();
        return [
                ...acc, {
                    ...cur,
                    PARSED_DATE: parsedDate,
                    DATE: moment(parsedDate).format('YYYY-MM-DD')
                }
            ]
        }, []);
        parsedChartDataResults.sort((a,b) => a.PARSED_DATE - b.PARSED_DATE);
        const selectionType = currentSelectionToolSelector(getState());
        const currentTraceColors = currentTraceColorsSelector(getState());
        const selectionName = selectionType === SELECTION_TYPES.POLYGON || selectionType === SELECTION_TYPES.CIRCLE ? 'AOI' : 'Point';
        const traceColor = generateRandomHexColor(currentTraceColors);
        if (actionType === STORE_TIME_SERIES_FEATURES_IDS) {
            const { groupByAttributes } = options;
            let { aggregationAttribute } = options;
            aggregationAttribute = `(${aggregationAttribute})`;
            return storeTimeSeriesChartData(
                selectionId,
                selectionGeometry,
                selectionName,
                selectionType,
                aggregateFunctionLabel,
                aggregateFunctionOption,
                aggregationAttribute,
                groupByAttributes,
                layerName,
                featuresIds,
                parsedChartDataResults,
                traceColor
            );
        }
        else if (actionType === CHANGE_AGGREGATE_FUNCTION) {
            return updateTimeSeriesChartData(selectionId, parsedChartDataResults);
        }
    });
};

export const openTimeSeriesPlotsPlugin = (action$) =>
    action$.ofType(TIME_SERIES_PLOTS)
        .switchMap(() => {
            return Rx.Observable.from([
                toggleControl(CONTROL_NAME),
            ]);
        });

export const timeSeriesPlotsPointSelectionPoint = (action$, {getState = () => {}}) => 
action$.ofType(TOGGLE_SELECTION)
    .filter(({selectionType}) => selectionType === SELECTION_TYPES.POINT)
    .switchMap(({selectionType}) => {
        if (selectionType) {
            const stopDrawingAction = changeDrawingStatus('stop', drawMethod(selectionType), CONTROL_NAME, []);
            const purgeMapInfoResultsAction = purgeMapInfoResults();
            const changeMousePointerAction = changeMousePointer('pointer');
            return action$.ofType(CLICK_ON_MAP).switchMap(({ point }) => {
                const timeSeriesLayers = timeSeriesLayersSelector(getState());
                if(!timeSeriesLayers.length) {
                    return Rx.Observable.empty();
                }
                return Rx.Observable.forkJoin(
                    timeSeriesLayers.map(timeSeriesLayer => {
                        const { queryAttribute } = timeSeriesLayer;
                        timeSeriesLayer = getLayerFromName(getState(), timeSeriesLayer.layerName);
                        let env = localizedLayerStylesEnvSelector(getState());
                        let { url, request, metadata } = buildIdentifyRequest(
                            timeSeriesLayer, 
                            {
                                ...identifyOptionsSelector(getState()), 
                                point,
                                env,
                                format: "application/json"
                            });
                        const excludeParams = ["SLD_BODY"];
                        const includeOptions = [
                            "buffer",
                            "cql_filter",
                            "filter",
                            "propertyName"
                        ];
                        if (url) {
                            const basePath = url;
                            const requestParams = request;
                            const lMetaData = metadata;
                            const appParams = filterRequestParams(timeSeriesLayer, includeOptions, excludeParams);
                            const attachJSON = isHighlightEnabledSelector(getState());
                            const itemId = itemIdSelector(getState());
                            const reqId = uuid.v1();
                            const param = { ...appParams, ...requestParams, propertyName: queryAttribute };
                            return getFeatureInfo(basePath, param, timeSeriesLayer, {attachJSON, itemId});
                        }
                        return Rx.Observable.empty();
                    })).switchMap(data => {
                        const features = data.map(item => item.features);
                        const selectionId = uuid.v1();
                        const selectionName = selectionType === SELECTION_TYPES.POLYGON || selectionType === SELECTION_TYPES.CIRCLE ? 'AOI' : 'Point';
                        return Rx.Observable.from(timeSeriesLayers.map((item, index) => {
                            /** in case of multiple features found use the 1st one, in the future we can use a more refined method */
                            const targetFeature = features[index].length > 0 ? [features[index][0]] : [features[index]];
                            return storeTimeSeriesFeaturesIds(
                                selectionId,
                                pointToFeature(point),
                                selectionName,
                                selectionType, 
                                item.layerName, 
                                targetFeature
                                .filter(feature => feature?.properties[item.queryAttribute])
                                .map(feature => feature.properties[item.queryAttribute]))
                        }))
                    }).catch((e) => Rx.Observable.of(errorFeatureInfo(uuid.v1(), e.data || e.statusText || e.status, {}, {})))
            })
            .merge(Rx.Observable.of(unRegisterEventListener(MOUSEMOVE_EVENT, CONTROL_NAME)))
            .startWith(
                stopDrawingAction,
                purgeMapInfoResultsAction,
                changeMousePointerAction
            )
            .takeUntil(
                Rx.Observable.merge(
                    action$.ofType(TEAR_DOWN),
                    // this stops once selection type changes
                    action$.ofType(TOGGLE_SELECTION)
                ))
        }
        return deactivate();
});

export const timeSeriesPlotsSelection = (action$, {getState = () => {}}) =>
    action$.ofType(TOGGLE_SELECTION)
    .filter(({selectionType}) => selectionType === SELECTION_TYPES.CIRCLE ||  selectionType === SELECTION_TYPES.POLYGON)
    .switchMap(({ selectionType }) => {
        if (selectionType) {
            const startDrawingAction = changeDrawingStatus('start', drawMethod(selectionType), CONTROL_NAME, [], { stopAfterDrawing: false });
            const changeMousePointerAction = changeMousePointer('auto');
            return action$.ofType(END_DRAWING).flatMap(({ geometry }) => {
                const timeSeriesLayers = timeSeriesLayersSelector(getState());
                return (timeSeriesLayers.length === 0 ? Rx.Observable.empty() :
                Rx.Observable.forkJoin(
                    timeSeriesLayers.map( timeSeriesLayer => 
                        getTimeSeriesFeatures(geometry, getState, timeSeriesLayer.layerName)
                    )
                )
                .filter(data => data.map(item => item.features.length )[0])
                .switchMap(data => {
                    const features = data.map(item => item.features);
                    const selectionId = uuid.v1();
                    const selectionName = selectionType === SELECTION_TYPES.POLYGON || selectionType === SELECTION_TYPES.CIRCLE ? 'AOI' : 'Point';
                    return Rx.Observable.from(timeSeriesLayers.map((item, index) => storeTimeSeriesFeaturesIds(
                        selectionId,
                        geometry,
                        selectionName,
                        selectionType, 
                        item.layerName, 
                        features[index]
                        .filter(feature => feature?.properties[item.queryAttribute])
                        .map(feature => feature.properties[item.queryAttribute] )))) 
                })
                .catch(e => {
                    console.log("Error in map selection"); // eslint-disable-line no-console
                    console.log(e); // eslint-disable-line no-console
                    return Rx.Observable.empty();                
                }))
                .merge(Rx.Observable.of(changeDrawingStatus('cleanAndContinueDrawing', drawMethod(selectionType), CONTROL_NAME, [], { stopAfterDrawing: false })))
            })
            .merge(Rx.Observable.of(unRegisterEventListener(MOUSEMOVE_EVENT, CONTROL_NAME))) // Reset map's mouse event trigger type
            .startWith(startDrawingAction, changeMousePointerAction)
            .takeUntil(action$.ofType(TEAR_DOWN))
            .concat(deactivate());
        }
        return deactivate();
    });

export const timeSeriesFetauresCurrentSelection = (action$, {getState = () => {}}) =>
    action$.ofType(STORE_TIME_SERIES_FEATURES_IDS).switchMap(({ selectionId, selectionGeometry, selectionType, featuresIds, layerName, type: actionType }) => {
        const url = selectedCatalogSelector(getState()).url;
        const timeSeriesLayer = getTimeSeriesLayerByName(getState(), layerName);
        const {
            queryAggregationAttribute: aggregationAttribute,
            queryByAttributes: groupByAttributes,
            queryLayerName,
            queryAttribute
        } = timeSeriesLayer;
        const fb = FilterBuilder({});
        const {property, or, filter} = fb;
        const ogcFilter = filter(or(featuresIds.map( id => property(queryAttribute).equalTo(id))));
        if (selectionType === SELECTION_TYPES.POLYGON) {
            const aggregateFunction = 'Average';
            const options = {
                aggregateFunction,
                aggregationAttribute,
                groupByAttributes
            };
            return getWPSChartData(
                actionType,
                url, 
                {featureType: queryLayerName, filter: ogcFilter, ...options},
                selectionId,
                selectionGeometry,
                layerName,
                getState,
                featuresIds
            );
        } else if (selectionType === SELECTION_TYPES.POINT) {
            return getWFSChartData({url, name: queryLayerName}, ogcFilter, { groupByAttributes }, aggregationAttribute, selectionId, selectionGeometry, getState, layerName, featuresIds)
        } else {
            return Rx.Observable.empty()
        }
    });

    export const changeAggregateFunction = (action$, {getState = () => {}}) =>
        action$.ofType(CHANGE_AGGREGATE_FUNCTION).switchMap(({ selectionId, type: actionType }) => {
            const timePlotData = timePlotDataSelector(getState(), selectionId);
            if (timePlotData.length > 0) {
                const wpsUrl = selectedCatalogSelector(getState()).url;
                const { layerName } = timePlotData[0];
                const aggregateFunction = timePlotData[0].aggregateFunctionOption.value || 'Average';
                const featuresIds = timePlotData[0].featuresIds;
                const selectionGeometry = timePlotData[0].selectionGeometry;
                const timeSeriesLayer = getTimeSeriesLayerByName(getState(), layerName);
                const {
                    queryAggregationAttribute: aggregationAttribute,
                    queryByAttributes: groupByAttributes,
                    queryLayerName,
                    queryAttribute
                } = timeSeriesLayer;
                const options = {
                    aggregateFunction,
                    aggregationAttribute,
                    groupByAttributes
                };
                const fb = FilterBuilder({});
                const {property, or, filter} = fb;
                const ogcFilter = filter(or(featuresIds.map( id => property(queryAttribute).equalTo(id))));
                return getWPSChartData(
                    actionType,
                    wpsUrl, 
                    {featureType: queryLayerName, filter: ogcFilter, ...options},
                    selectionId,
                    selectionGeometry,
                    layerName,
                    getState,
                    featuresIds
                );
            };
            return Rx.Observable.empty();
        });

    export const syncSelectionsLayers = (action$,  {getState = () => {}}) =>
        action$.ofType(
            STORE_TIME_SERIES_CHART_DATA,
            REMOVE_TABLE_SELECTION_ROW,
            CHANGE_TRACE_COLOR,
            CLEAR_ALL_SELECTIONS,
            SETUP
            ).switchMap(() => {
            return Rx.Observable.of(updateAdditionalLayer(
                TIME_SERIES_SELECTIONS_LAYER,
                CONTROL_NAME,
                'overlay',
                {
                    type: 'vector',
                    features: timeSeriesFeaturesSelectionsSelector(getState()).map(feature => reprojectGeoJson(feature, feature.properties.projection, 'EPSG:4326')),
                    name:`${CONTROL_NAME}`,
                    id:`${CONTROL_NAME}`,
                    visibility: true
                })
            )
        });