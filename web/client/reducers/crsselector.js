import { CHANGE_CRS_INPUT_VALUE, SET_PROJECTIONS_CONFIG } from '../actions/crsselector';
function crsselector(state = {projections: [], config: {}}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return Object.assign({}, state, {
            value: action.value
        });
    case SET_PROJECTIONS_CONFIG:
        return Object.assign({}, state, {
            config: { ...state.config, ...action.config }
        });
    default:
        return state;
    }
}

export default crsselector;
