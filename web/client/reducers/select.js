import { SELECT_STORE_CFG, ADD_OR_UPDATE_SELECTION } from '../actions/select';

export default function select(state = {cfg: {}, selections: {}}, action) {
    switch (action.type) {
    case SELECT_STORE_CFG: {
        return {
            ...state,
            cfg: action.cfg
        };
    }
    case ADD_OR_UPDATE_SELECTION: {
        return {
            ...state,
            selections: {...state.selections, [action.layer.id]: action.geoJsonData}
        };
    }
    default:
        return state;
    }
}
