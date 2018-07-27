const { UPDATE_LAYER_TIME_DATA, SET_CURRENT_TIME } = require('../actions/timemanager');
const { set } = require('../utils/ImmutableUtils');

module.exports = (state, action) => {
    switch (action.type) {
        case UPDATE_LAYER_TIME_DATA: {
            return set(`timeData[${action.layerId}]`, action.data, state);
        }
        case SET_CURRENT_TIME: {
            return set(`currentTime`, action.time);
        }
        default:
            return state;
    }
};
