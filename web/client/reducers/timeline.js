const { RANGE_CHANGED } = require('../actions/timeline');
const { RANGE_DATA_LOADED } = require('../actions/timeline');
const { set } = require('../utils/ImmutableUtils');

module.exports = (state = {}, action) => {
    switch (action.type) {
        case RANGE_CHANGED: {
            return set(`range`, {
                start: action.start,
                end: action.end
            },
            state);
        }
        case RANGE_DATA_LOADED: {
            return set(`rangeData[${action.layerId}]`, {
                range: action.range,
                histogram: action.histogram,
                domain: action.domain
            }, state);
        }
        default:
            return state;
    }
    return state;
};
