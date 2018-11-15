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

const STATUS = {
    PLAY: "PLAY",
    STOP: "STOP",
    PAUSE: "PAUSE"
};

const play = () => ({ type: PLAY});
const pause = () => ({ type: PAUSE });
const stop = () => ({ type: STOP });
const setFrames = (frames) => ({ type: SET_FRAMES, frames});
const setCurrentFrame = frame => ({ type: SET_CURRENT_FRAME, frame});
const appendFrames = (frames) => ({ type: APPEND_FRAMES, frames});
const framesLoading = loading => ({ type: FRAMES_LOADING, loading});
const selectPlaybackRange = range => ({ type: SELECT_PLAYBACK_RANGE, range});
const changeSetting = (name, value) => ({type: CHANGE_SETTING, name, value });
const toggleAnimationMode = () => ({type: TOGGLE_ANIMATION_MODE});

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
    TOGGLE_ANIMATION_MODE
};
