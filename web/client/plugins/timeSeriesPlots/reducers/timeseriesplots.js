import { set } from '@mapstore/utils/ImmutableUtils';
import { TIME_SERIES_PLOTS, SELECT_NODE } from '../../../actions/layers';
import { 
    CHANGE_TRACE_COLOR,
    STORE_TIME_SERIES_CHART_DATA,
    TEAR_DOWN,
    TOGGLE_SELECTION,
    SETUP,
    SET_CURRENT_SELECTION,
    REMOVE_TABLE_SELECTION_ROW
} from '../actions/timeSeriesPlots';

const INITIAL_STATE = {
    timePlotsData: []
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
        case CHANGE_TRACE_COLOR: {
            const { selectionId, color } = action;
            const timePlotsData = state.timePlotsData.reduce((acc, cur) => (
                [ ...acc, 
                    { 
                        ...cur, 
                        traceColor: cur.selectionId === selectionId ? color : cur.traceColor
                    }
                ]
            ), []);
            return {
                ...state,
                timePlotsData
            }
        }
        case STORE_TIME_SERIES_CHART_DATA: {
            const { selectionId, selectionType, layerName, chartData, traceColor } = action;
            let { selectionName } = action;
            selectionName = `${selectionName} ${state.timePlotsData.length + 1}`;
            return {
                ...state,
                timePlotsData: [...state.timePlotsData, {selectionId, selectionName, selectionType, layerName, chartData, traceColor}]
            }
        }
        case SET_CURRENT_SELECTION:
            const { index } = action;
            return set('currentSelectionIndex', index, state);
        case TIME_SERIES_PLOTS: {
            return state;
        }
        case TOGGLE_SELECTION: {
            const { selectionType } = action;
            return set("selectionType", selectionType, state);
        }
        case REMOVE_TABLE_SELECTION_ROW: {
            const { selectionId } = action;
            return {
                ...state,
                timePlotsData: state.timePlotsData
                .filter(timePlotData => timePlotData.selectionId !== selectionId)
                .map((item, index) => ({
                    ...item,
                    selectionName: `${(item.selectionType === 'POLYGON' || item.selectionType === 'CIRCLE' ? 'AOI' : 'Point')} ${index + 1}`
                }))
            }
        }
        default:
            return state;
    }
}