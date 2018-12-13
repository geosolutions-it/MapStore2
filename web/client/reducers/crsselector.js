const {CHANGE_CRS_INPUT_VALUE} = require('../actions/crsselector');

const assign = require('object-assign');
function crsselector(state = {projections: []}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return assign({}, state, {
            value: action.value
        });
    default:
        return state;
    }
}

module.exports = crsselector;
