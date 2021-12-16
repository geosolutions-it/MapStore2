import { set } from '@mapstore/utils/ImmutableUtils';
import { TIME_SERIES_PLOTS, SELECT_NODE } from '../../../actions/layers';
import { RESET, TOGGLE_SELECTION } from '../actions/timeSeriesPlots';

const INITIAL_STATE = {};

export default function timeSeriesPlots(state = INITIAL_STATE, action) {
    const type = action?.type;
    switch(type) {
        case RESET: {
            return INITIAL_STATE;
        }
        // this is temporary just to wire-up layer selection
        // we will setup a dropdown to select a single
        // layer directly from the plugin window
        case SELECT_NODE: {
            const { id } = action;
            return set("selectedLayer.id", id, state);
        }
        case TIME_SERIES_PLOTS: {
            const { layer: { url, id } } = action;
            return set("selectedLayer", { url, id }, state);
        }
        case TOGGLE_SELECTION: {
            const { selectionType } = action;
            return set("selectionType", selectionType, state);
        }
        default:
            return state;
    }
}