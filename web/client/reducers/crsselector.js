import { CHANGE_CRS_INPUT_VALUE, SET_CAN_EDIT_PROJECTION, SET_PROJECTIONS_CONFIG } from '../actions/crsselector';
function crsselector(state = {projections: [], config: {}, canEdit: undefined}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return Object.assign({}, state, {
            value: action.value
        });
    case SET_PROJECTIONS_CONFIG:
        return Object.assign({}, state, {
            config: { ...state.config, ...action.config }
        });
    case SET_CAN_EDIT_PROJECTION:
        return Object.assign({}, state, {
            canEdit: action.canEdit
        });
    default:
        return state;
    }
}

export default crsselector;
