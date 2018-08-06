const { UPDATE_LAYER_DIMENSION_DATA, SET_CURRENT_TIME } = require('../actions/dimension');
const { set } = require('../utils/ImmutableUtils');

module.exports = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_LAYER_DIMENSION_DATA: {
            return set(`data[${action.dimension}][${action.layerId}]`, action.data, state);
        }
        case SET_CURRENT_TIME: {
            return set(`currentTime`, action.time, state);
        }
        default:
            return state;
    }
    return state;
};
