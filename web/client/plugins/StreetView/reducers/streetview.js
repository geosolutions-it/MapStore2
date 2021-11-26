
import { CONFIGURE, SET_LOCATION, SET_POV, API_LOADING, API_LOADED, RESET } from '../actions/streetView';

const INITIAL_STATE = {};
export default function streetView(state = INITIAL_STATE, action) {
    const type = action?.type;
    switch (type) {
    case CONFIGURE: {
        return {
            ...state,
            configuration: action?.configuration
        };
    }
    case SET_LOCATION: {
        return {
            ...state,
            location: action?.location ?? state.location

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
    case RESET: {
        return INITIAL_STATE;
    }
    default:
        return state;
    }
}
