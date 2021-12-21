import { set } from '@mapstore/utils/ImmutableUtils';
import { TIME_SERIES_PLOTS, SELECT_NODE } from '../../../actions/layers';
import { STORE_TIME_SERIES_FEATURES, TEAR_DOWN, TOGGLE_SELECTION, SETUP } from '../actions/timeSeriesPlots';

const INITIAL_STATE = {
    selections: []
};

export default function timeSeriesPlots(state = INITIAL_STATE, action) {
    const type = action?.type;
    switch(type) {
        case TEAR_DOWN: {
            return INITIAL_STATE;
        }
        // this is temporary just to wire-up layer selection
        // we will setup a dropdown to select a single
        // layer directly from the plugin window
        case SELECT_NODE: {
            const { id } = action;
            return set("selectedLayer.id", id, state);
        }
        case SETUP:
            const { cfg } = action;
            return set('pluginCfg', cfg, state);
        case STORE_TIME_SERIES_FEATURES: {
            const { selectionType, layerName, features } = action;
            return {
                ...state,
                selections: [...state.selections, {selectionType, layerName, features}]
            }
        }
        case TIME_SERIES_PLOTS: {
            return state;
        }
        case TOGGLE_SELECTION: {
            const { selectionType } = action;
            return set("selectionType", selectionType, state);
        }
        default:
            return state;
    }
}