/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import {
    END_DRAWING,
    changeDrawingStatus
} from '@mapstore/actions/draw';

import { getLayerFromName } from '@mapstore/selectors/layers';
import { getLayerJSONFeature } from '@mapstore/observables/wfs';
import { SELECTION_TYPES, CONTROL_NAME } from '../constants';
import FilterBuilder from '@mapstore/utils/ogc/Filter/FilterBuilder';
import wpsAggregate from '@mapstore/observables/wps/aggregate';
import { selectedCatalogSelector } from '@mapstore/selectors/catalog';
import { featuresSelectionsSelector, timeSeriesCatalogServiceSelector, timeSeriesLayersSelector, getTimeSeriesLayerByName } from '../selectors/timeSeriesPlots';
import { TIME_SERIES_PLOTS } from '@mapstore/actions/layers';
import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { setCurrentFeaturesSelectionIndex, storeTimeSeriesFeaturesIds, STORE_TIME_SERIES_FEATURES_IDS, TOGGLE_SELECTION } from '../actions/timeSeriesPlots';

/**
 * Extract the drawMethod for DrawSupport from the method
 * @param {string} selection the current tool selected
 */
 const drawMethod = (selection) => {
    switch (selection) {
    case SELECTION_TYPES.CIRCLE:
        return "Circle";
    case SELECTION_TYPES.LINE_STRING:
        return "LineString";
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
            attribute: "the_geom", // TODO: get the geom attribute from config
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


export const timeSeriesPlotsSelection = (action$, {getState = () => {}}) =>
    action$.ofType(TOGGLE_SELECTION).switchMap(({ selectionType }) => {
        if (selectionType) {
            const startDrawingAction = changeDrawingStatus('start', drawMethod(selectionType), CONTROL_NAME, [], { stopAfterDrawing: true });
            return action$.ofType(END_DRAWING).flatMap(({geometry}) => {
                const timeSeriesLayers = timeSeriesLayersSelector(getState());
                return timeSeriesLayers.length === 0 ? Rx.Observable.empty() :
                Rx.Observable.forkJoin(
                    timeSeriesLayers.map( timeSeriesLayer => 
                        getTimeSeriesFeatures(geometry, getState, timeSeriesLayer.layerName)
                    )
                ).switchMap(data => {
                    const features = selectionType === SELECTION_TYPES.POLYGON ? data.map(item => item.features) : [data.feature];
                    return Rx.Observable.from(timeSeriesLayers.map((item, index) => storeTimeSeriesFeaturesIds(selectionType, item.layerName, 
                        features[index]
                        .filter(feature => feature?.properties[item.queryAttribute])
                        .map(feature => feature.properties[item.queryAttribute] )))) 
                })
            })
            .startWith(startDrawingAction);
        }
        return Rx.Observable.empty();
    });

export const timeSeriesFetauresCurrentSelection = (action$, {getState = () => {}}) => 
    action$.ofType(STORE_TIME_SERIES_FEATURES_IDS).switchMap(({featuresIds, layerName}) => {
        const wpsUrl = selectedCatalogSelector(getState()).url;
        const timeSeriesLayer = getTimeSeriesLayerByName(getState(), layerName);
        const options = {
            aggregateFunction: timeSeriesLayer.queryAggregateFunction,
            aggregationAttribute: timeSeriesLayer.queryAggregationAttribute,
            groupByAttributes: timeSeriesLayer.queryByAttributes
        };
        const queryLayerName = timeSeriesLayer.queryLayerName;
        const queryAttribute = timeSeriesLayer.queryAttribute
        const fb = FilterBuilder({});
        const {property, or, filter} = fb;
        const ogcFilter = filter(or(featuresIds.map( id => property(queryAttribute).equalTo(id))));
        return wpsAggregate(wpsUrl, {featureType: queryLayerName, ...options, filter: ogcFilter}, {
            timeout: 15000
        })
        // .map(result => addTimeseriesData(result));
        .do(x => console.log(x))
        .ignoreElements()
    });
    
// export const timeSeriesFetauresCurrentSelection = (action$, {getState = () => {}}) => 
//     action$.ofType(STORE_TIME_SERIES_FEATURES_IDS).switchMap(() => {
//         const currentSelectionIndex = featuresSelectionsSelector(getState());
//         return Rx.Observable.of(setCurrentFeaturesSelectionIndex(currentSelectionIndex));
//     })