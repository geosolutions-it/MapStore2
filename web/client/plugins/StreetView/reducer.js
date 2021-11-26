
import { SET_LOCATION, SET_POV, API_LOADING, API_LOADED } from './actions';

export default function streetView(state = {}, action) {
    const type = action?.type;
    switch (type) {
    case SET_LOCATION: {
        return {
            ...state,
            location: action?.location ?? state.location,

        };
    }
    case SET_POV: {
        return {
            ...state,
            pov: action?.pov ?? state.pov
        };
    }
    case API_LOADING: {
        return {
            ...state,
            apiLoading: action?.loading
        };
    }
    case API_LOADED: {
        return {
            ...state,
            apiLoaded: true
        };
    }
    default:
        return state;
    }
}
