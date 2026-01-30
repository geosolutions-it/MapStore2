<<<<<<< HEAD
import { CHANGE_CRS_INPUT_VALUE, SET_CAN_EDIT_PROJECTION, SET_PROJECTIONS_CONFIG } from '../actions/crsselector';
function crsselector(state = {projections: [], config: {}, canEdit: undefined}, action) {
=======
import { CHANGE_CRS_INPUT_VALUE, SET_PROJECTIONS_CONFIG } from '../actions/crsselector';
function crsselector(state = {projections: [], config: {}}, action) {
>>>>>>> d05e604 (Fix #11879 Improve CRS selector component (#11880))
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return Object.assign({}, state, {
            value: action.value
        });
    case SET_PROJECTIONS_CONFIG:
        return Object.assign({}, state, {
            config: { ...state.config, ...action.config }
        });
<<<<<<< HEAD
    case SET_CAN_EDIT_PROJECTION:
        return Object.assign({}, state, {
            canEdit: action.canEdit
        });
=======
>>>>>>> d05e604 (Fix #11879 Improve CRS selector component (#11880))
    default:
        return state;
    }
}

export default crsselector;
