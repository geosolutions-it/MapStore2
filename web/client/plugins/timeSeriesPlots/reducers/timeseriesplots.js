import { TIME_SERIES_PLOTS } from '../../../actions/layers';
import { RESET } from '../actions/timeSeriesPlots';

const INITIAL_STATE = {};

export default function timeSeriesPlots(state = INITIAL_STATE, action) {
    const type = action?.type;
    switch(type) {
        case RESET: {
            return INITIAL_STATE;
        }
        case TIME_SERIES_PLOTS: {
            return state;
        }
        default:
            return state;
    }
}