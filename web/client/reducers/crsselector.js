import { CHANGE_CRS_INPUT_VALUE } from '../actions/crsselector';
import assign from 'object-assign';
function crsselector(state = {projections: []}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return assign({}, state, {
            value: action.value
        });
    default:
        return state;
    }
}

export default crsselector;
