const { RANGE_CHANGED } = require('../actions/timeline');
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
        default:
            return state;
    }
    return state;
};
