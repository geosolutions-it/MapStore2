const { PLAY, PAUSE, STOP, STATUS, SET_FRAMES, APPEND_FRAMES, FRAMES_LOADING, SET_CURRENT_FRAME } = require('../actions/playback');
const { set } = require('../utils/ImmutableUtils');

module.exports = (state = { status: STATUS.STOP, currentFrame: -1}, action) => {
    switch (action.type) {
        case PLAY: {
            return set(`status`, STATUS.PLAY, state);
        }
        case PAUSE: {
            return set(`status`, STATUS.PAUSE, state);
        }
        case STOP: {
            return set(`status`, STATUS.STOP,
                set('currentFrame', -1, state)
            );
        }
        case SET_FRAMES: {
            return set('frames', action.frames,
                set('currentFrame', -1, state)
            );
        }
        case FRAMES_LOADING: {
            return set('framesLoading', action.loading, state);
        }
        case APPEND_FRAMES: {
            return set('frames', [
                ...(state.frames || []),
                ...action.frames
            ], state);
        }
        case SET_CURRENT_FRAME: {
            return set('currentFrame', action.frame, state);
        }
        default:
            return state;
    }
    return state;
};
