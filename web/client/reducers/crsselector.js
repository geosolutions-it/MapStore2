const {CHANGE_CRS_INPUT_VALUE} = require('../actions/crsselector');
const {CHANGE_MAP_CRS} = require('../actions/map');

const assign = require('object-assign');
function crsselector(state = {projections: []}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return assign({}, state, {
            value: action.value
        });
    case CHANGE_MAP_CRS: {
        return assign({}, state, {
            selected: action.crs
        });
    }
    default:
        return state;
    }
}

module.exports = crsselector;
