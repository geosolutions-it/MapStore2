import { SELECT_STORE_CFG, ADD_OR_UPDATE_SELECTION } from '../actions/layersSelection';

/**
 * Reducer for managing selection configuration and selection data per layer.
 *
 * @param {Object} state - Current selection state.
 * @param {Object} state.cfg - Selection configuration object.
 * @param {Object} state.selections - GeoJSON selection results keyed by layer ID.
 * @param {Object} action - Redux action.
 * @param {string} action.type - Action type.
 * @returns {Object} New state after applying the action.
 */
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
