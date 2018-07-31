const LOAD_TIME_DATA = "TIME_MANAGER:LOAD_TIME_DATA";
const UPDATE_LAYER_TIME_DATA = "TIME_MANAGER:UPDATE_LAYER_TIME_DATA";
const SET_CURRENT_TIME = "TIME_MANAGER:SET_CURRENT_TIME";
module.exports = {
    LOAD_TIME_DATA,
    updateLayerTimeData: (data) => ({type: UPDATE_LAYER_TIME_DATA, data}),
    SET_CURRENT_TIME,
    setCurrentTime: time => ({type: SET_CURRENT_TIME, time})
};
