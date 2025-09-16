import { SET_PENDING_CHANGES } from "../actions/save";

const defaultState = {
    pendingChanges: {}
};

function save(state = defaultState, action) {
    switch (action.type) {
    case SET_PENDING_CHANGES:
        return {
            ...state,
            pendingChanges: action.pendingChanges
        };
    default:
        return state;
    }
}

export default save;
