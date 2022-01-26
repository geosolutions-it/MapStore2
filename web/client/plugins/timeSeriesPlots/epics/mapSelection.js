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
import { CONTROL_NAME, MOUSEMOVE_EVENT, SELECTION_TYPES } from '../constants';
import FilterBuilder from '@mapstore/utils/ogc/Filter/FilterBuilder';
import { generateRandomHexColor } from '@mapstore/utils/ColorUtils';
import { wpsAggregateToChartData } from '@mapstore/components/widgets/enhancers/wpsChart';
import wpsAggregate from '@mapstore/observables/wps/aggregate';
import { selectedCatalogSelector } from '@mapstore/selectors/catalog';
import {
    timePlotDataSelector,
    timeSeriesLayersSelector,
    getTimeSeriesLayerByName,
    currentSelectionToolSelector,
    currentTraceColorsSelector
} from '../selectors/timeSeriesPlots';
import { TIME_SERIES_PLOTS } from '@mapstore/actions/layers';
import { CLICK_ON_MAP, MOUSE_MOVE, MOUSE_OUT, registerEventListener, unRegisterEventListener } from '@mapstore/actions/map';
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
    TEAR_DOWN, TOGGLE_SELECTION
} from '../actions/timeSeriesPlots';
import { point } from 'leaflet';
import { isMapPopup, isHighlightEnabledSelector, itemIdSelector, overrideParamsSelector, identifyOptionsSelector } from '@mapstore/selectors/mapInfo';
import {addPopup, cleanPopups, removePopup, REMOVE_MAP_POPUP} from '@mapstore/actions/mapPopups';
import { IDENTIFY_POPUP } from '@mapstore/components/map/popups';
import { localizedLayerStylesEnvSelector } from '@mapstore/selectors/localizedLayerStyles';
import { buildIdentifyRequest, filterRequestParams } from '@mapstore/utils/MapInfoUtils';
import { getFeatureInfo } from '@mapstore/api/identify';
import {getMessageById} from '@mapstore/utils/LocaleUtils';

const CLEAN_ACTION = changeDrawingStatus("clean");
const DEACTIVATE_ACTIONS = [
    CLEAN_ACTION,
    changeDrawingStatus("stop"),
    registerEventListener(MOUSEMOVE_EVENT, CONTROL_NAME),
    // loading(0, "plotSelection") // reset loading if stopped due to close
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
            purgeMapInfoResults();
            return action$.ofType(CLICK_ON_MAP).switchMap(({ point }) => {
                const timeSeriesLayers = timeSeriesLayersSelector(getState());
                const projection = projectionSelector(getState());
                const $out = Rx.Observable.from(timeSeriesLayers.filter(l => l.layerName))
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
                            return storeTimeSeriesFeaturesIds(
                                selectionId,
                                selectionName,
                                selectionType, 
                                item.layerName, 
                                features[index]
                                .filter(feature => feature?.properties[item.queryAttribute])
                                .map(feature => feature.properties[item.queryAttribute] ))
                        }))
                    }).catch((e) => Rx.Observable.of(errorFeatureInfo(uuid.v1(), e.data || e.statusText || e.status, {}, {})))
                    // timeSeriesLayers.map(
                        // timeSeriesLayer => 
                        // Rx.Observable.of(
                        // featureInfoClick(updatePointWithGeometricFilter(point, projection), timeSeriesLayers[0]),  cancelSelectedItem())
                        // .merge(
                        //     Rx.Observable.of(
                        //         addPopup(uuid.v1(), {component: IDENTIFY_POPUP, maxWidth: 600, position: {coordinates: point ? point.rawPos : []}})
                        //     )
                        // )// .filter(() => isMapPopup())
                    // )
                // );
                // if (selectionType === SELECTION_TYPES.POINT) {
                //     const point = toPoint(geometry?.coordinates && [geometry.coordinates[1], geometry.coordinates[0]] || []);
                //     const bufferedPoint = reprojectGeoJson(buffer(point, 200, {units: 'meters'}), 'EPSG:4326', 'EPSG:3857');
                //     geometry = bufferedPoint.geometry;
                //     geometry.projection = 'EPSG:3857';
                // };  
            })
            // .merge(Rx.Observable.of(unRegisterEventListener(MOUSEMOVE_EVENT, CONTROL_NAME)))
            //.startWith(startDrawingAction)
            .takeUntil(action$.ofType(TEAR_DOWN))
            // .concat(deactivate());
        }
        return deactivate();
});

export const timeSeriesPlotsSelection = (action$, {getState = () => {}}) =>
    action$.ofType(TOGGLE_SELECTION)
    .filter(({selectionType}) => selectionType === SELECTION_TYPES.CIRCLE ||  selectionType === SELECTION_TYPES.POLYGON)
    .switchMap(({ selectionType }) => {
        if (selectionType) {
            const startDrawingAction = changeDrawingStatus('start', drawMethod(selectionType), CONTROL_NAME, [], { stopAfterDrawing: true });
            return action$.ofType(END_DRAWING).flatMap(({ geometry }) => {
                const timeSeriesLayers = timeSeriesLayersSelector(getState());
                return timeSeriesLayers.length === 0 ? Rx.Observable.empty() :
                Rx.Observable.forkJoin(
                    timeSeriesLayers.map( timeSeriesLayer => 
                        getTimeSeriesFeatures(geometry, getState, timeSeriesLayer.layerName)
                    )
                ).switchMap(data => {
                    const features = data.map(item => item.features);
                    const selectionId = uuid.v1();
                    const selectionName = selectionType === SELECTION_TYPES.POLYGON || selectionType === SELECTION_TYPES.CIRCLE ? 'AOI' : 'Point';
                    return Rx.Observable.from(timeSeriesLayers.map((item, index) => storeTimeSeriesFeaturesIds(
                        selectionId,
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
                })
            })
            .merge(Rx.Observable.of(unRegisterEventListener(MOUSEMOVE_EVENT, CONTROL_NAME))) // Reset map's mouse event trigger type
            .startWith(startDrawingAction)
            .takeUntil(action$.ofType(TEAR_DOWN))
            .concat(deactivate());
        }
        return deactivate();
    });

export const timeSeriesFetauresCurrentSelection = (action$, {getState = () => {}}) =>
    action$.ofType(STORE_TIME_SERIES_FEATURES_IDS).switchMap(({ selectionId, featuresIds, layerName }) => {
        const wpsUrl = selectedCatalogSelector(getState()).url;
        const timeSeriesLayer = getTimeSeriesLayerByName(getState(), layerName);
        /** review this string, how to make it transaltable*/
        const aggregateFunctionOption = { value: "Average", label: 'AVG'};
        const aggregateFunction = aggregateFunctionOption.value;
        const aggregateFunctionLabel = aggregateFunctionOption.label;
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
        return wpsAggregate(wpsUrl, {featureType: queryLayerName, ...options, filter: ogcFilter}, {
            timeout: 15000
        })
        .map(aggregationResults => wpsAggregateToChartData(aggregationResults, [groupByAttributes], [aggregationAttribute], [aggregateFunction]))
        .map(chartDataResults => {
            const parsedChartDataResults = chartDataResults.reduce((acc, cur) => {
            const parsedDate = moment(cur.DATE.replace('F', ''), "YYYYMMDD").toDate();
            return [
                    ...acc, {
                        ...cur,
                        PARSED_DATE: parsedDate,
                        DATE: moment(parsedDate).format('DD/MM/YYYY')
                    }
                ]
            }, []);
            parsedChartDataResults.sort((a,b) => a.PARSED_DATE - b.PARSED_DATE);
            const selectionType = currentSelectionToolSelector(getState());
            const currentTraceColors = currentTraceColorsSelector(getState());
            const selectionName = selectionType === SELECTION_TYPES.POLYGON || selectionType === SELECTION_TYPES.CIRCLE ? 'AOI' : 'Point';
            const traceColor = generateRandomHexColor(currentTraceColors);
            return storeTimeSeriesChartData(selectionId, selectionName, selectionType, aggregateFunctionLabel, aggregateFunctionOption, layerName, featuresIds, parsedChartDataResults, traceColor);
        });
    });

    export const changeAggregateFunction = (action$, {getState = () => {}}) =>
        action$.ofType(CHANGE_AGGREGATE_FUNCTION).switchMap(({ selectionId }) => {
            const timePlotData = timePlotDataSelector(getState(), selectionId);
            if (timePlotData.length > 0) {
                const wpsUrl = selectedCatalogSelector(getState()).url;
                const { layerName } = timePlotData[0];
                const aggregateFunction = timePlotData[0].aggregateFunctionOption.value || 'Average';
                const featuresIds = timePlotData[0].featuresIds;
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
                return wpsAggregate(wpsUrl, {featureType: queryLayerName, ...options, filter: ogcFilter}, {
                    timeout: 15000
                })
                .map(aggregationResults => wpsAggregateToChartData(aggregationResults, [groupByAttributes], [aggregationAttribute], [aggregateFunction]))
                .map(chartDataResults => {
                    const parsedChartDataResults = chartDataResults.reduce((acc, cur) => {
                    const parsedDate = moment(cur.DATE.replace('F', ''), "YYYYMMDD").toDate();
                    return [
                            ...acc, {
                                ...cur,
                                PARSED_DATE: parsedDate,
                                DATE: moment(parsedDate).format('DD/MM/YYYY')
                            }
                        ]
                    }, []);
                    parsedChartDataResults.sort((a,b) => a.PARSED_DATE - b.PARSED_DATE);
                    return updateTimeSeriesChartData(selectionId, parsedChartDataResults);
                })
            };
            return Rx.Observable.empty();
        });