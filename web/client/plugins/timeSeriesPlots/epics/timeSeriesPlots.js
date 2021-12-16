import Rx from 'rxjs';

import {
    END_DRAWING,
    changeDrawingStatus
} from '@mapstore/actions/draw';

import { getLayerFromId } from '@mapstore/selectors/layers';
import { getLayerJSONFeature } from '@mapstore/observables/wfs';
import { SELECTION_TYPES } from '../constants';
import { timeSeriesLayerIdSelector } from '../selectors/timeSeriesPlots';
import { TIME_SERIES_PLOTS } from '@mapstore/actions/layers';
import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { TOGGLE_SELECTION, storeTimeSeriesFeatures } from '../actions/timeSeriesPlots';

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

const getTimeSeriesFeatures = (geometry, getState, timeSeriesLayerId) => {
    const timeSeriesLayer = getLayerFromId(getState(), timeSeriesLayerId);
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
                toggleControl("timeSeriesPlots"),
            ]);
        });

export const timeSeriesPlotsSelection = (action$, {getState = () => {}}) =>
    action$.ofType(TOGGLE_SELECTION).switchMap(({ selectionType }) => {
        if (selectionType) {
            const startDrawingAction = changeDrawingStatus('start', drawMethod(selectionType), 'timeSeriesPlots', [], { stopAfterDrawing: true });
            return action$.ofType(END_DRAWING).flatMap(({geometry}) => {
                const timeSeriesLayerId = timeSeriesLayerIdSelector(getState());
                // query WFS
                return getTimeSeriesFeatures(geometry, getState, timeSeriesLayerId)
                    .switchMap(({ features = []} = {}) => {
                        // temporary name jsut to complete the epic correctly
                        return Rx.Observable.of(storeTimeSeriesFeatures(selectionType, timeSeriesLayerId, features));
                    });
            })
            .startWith(startDrawingAction);
        }
        return Rx.Observable.empty();
    });