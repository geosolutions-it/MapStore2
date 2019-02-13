const PLAY = "PLAYBACK:START";
const PAUSE = "PLAYBACK:PAUSE";
const STOP = "PLAYBACK:STOP";

const SET_FRAMES = "PLAYBACK:SET_FRAMES";
const APPEND_FRAMES = "PLAYBACK:APPEND_FRAMES";
const FRAMES_LOADING = "PLAYBACK:FRAMES_LOADING";
const SET_CURRENT_FRAME = "PLAYBACK:SET_CURRENT_FRAME";
const SELECT_PLAYBACK_RANGE = "PLAYBACK:SELECT_PLAYBACK_RANGE";

const CHANGE_SETTING = "PLAYBACK:SETTINGS_CHANGE";
const TOGGLE_ANIMATION_MODE = "PLAYBACK:TOGGLE_ANIMATION_MODE";
const ANIMATION_STEP_MOVE = "PLAYBACK:ANIMATION_STEP_MOVE";
const UPDATE_METADATA = "PLAYBACK:UPDATE_METADATA";

const STATUS = {
    PLAY: "PLAY",
    STOP: "STOP",
    PAUSE: "PAUSE"
};

const play = () => ({ type: PLAY});
const pause = () => ({ type: PAUSE });
const stop = () => ({ type: STOP });

/**
 * Starts the animation adding animation frames to the frames buffer
 * @param {string[]} frames Array of dates in ISO format
 */
const setFrames = (frames) => ({ type: SET_FRAMES, frames});

/**
 * Set current animation frame as n-th element of the frames buffer, where n is the `frame` argument passed.
 * @param {integer} frame index of the frame
 */
const setCurrentFrame = frame => ({ type: SET_CURRENT_FRAME, frame});

/**
 * Appends animation frames to the animation frame buffer.
 * @param {string[]} frames Array of dates in ISO format
 */
const appendFrames = (frames) => ({ type: APPEND_FRAMES, frames});
const framesLoading = loading => ({ type: FRAMES_LOADING, loading});

/**
 * Configures current playback range
 * @param {object} range playback range it must have this form ( or `undefined` to unset)
 * ```
 * {
 *  startPlaybackRange: ISO9601String
 *  endPlaybackRange: ISO9601String
 * }
 * ```
 */
const selectPlaybackRange = range => ({ type: SELECT_PLAYBACK_RANGE, range});
const changeSetting = (name, value) => ({type: CHANGE_SETTING, name, value });
const toggleAnimationMode = () => ({type: TOGGLE_ANIMATION_MODE});

/**
 * Move the cursor one step forward or backward, depending on direction.
 * @param {string} direction `"asc"` or `"desc"`
 */
const animationStepMove = (direction) => ({
    type: ANIMATION_STEP_MOVE,
    direction
});

const updateMetadata = ({next, previous, forTime}) => ({
    type: UPDATE_METADATA,
    forTime,
    next,
    previous
});

module.exports = {
    play,
    stop,
    pause,
    setFrames,
    appendFrames,
    framesLoading,
    setCurrentFrame,
    selectPlaybackRange,
    changeSetting,
    toggleAnimationMode,
    animationStepMove,
    updateMetadata,
    PLAY,
    PAUSE,
    STOP,
    STATUS,
    SET_FRAMES,
    APPEND_FRAMES,
    FRAMES_LOADING,
    SET_CURRENT_FRAME,
    SELECT_PLAYBACK_RANGE,
    CHANGE_SETTING,
    TOGGLE_ANIMATION_MODE,
    ANIMATION_STEP_MOVE,
    UPDATE_METADATA
};
