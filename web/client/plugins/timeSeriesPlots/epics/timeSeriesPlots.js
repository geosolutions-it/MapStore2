import Rx from 'rxjs';

import {
    END_DRAWING,
    changeDrawingStatus
} from '@mapstore/actions/draw';

import { TIME_SERIES_PLOTS } from '@mapstore/actions/layers';
import { TOGGLE_CONTROL, toggleControl } from '@mapstore/actions/controls';
import { TOGGLE_SELECTION } from '../actions/timeSeriesPlots';

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

export const openTimeSeriesPlotsPlugin = (action$) =>
    action$.ofType(TIME_SERIES_PLOTS)
        .switchMap(() => {
            return Rx.Observable.from([
                toggleControl("timeSeriesPlots"),
            ]);
        });

export const timeSeriesPlotsSelection = (action$, {getState = () => {}}) => 
    actions$.ofType(TOGGLE_SELECTION).switchMap(({ selectionType }) => {
        if (selectionType) {
            const startDrawingAction = changeDrawingStatus('start', drawMethod(selectionType), 'timeSeriesPlots', [], { stopAfterDrawing: true })
            return action$.ofType(END_DRAWING).flatMap(({geometry}) => {
                // const timeSeriesLayerId = timeSeriesLayerIdSelector()
            });
        }
    });