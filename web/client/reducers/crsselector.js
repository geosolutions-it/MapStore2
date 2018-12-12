const {
    CHANGE_CRS_INPUT_VALUE
} = require('../actions/crsselector');
const {CHANGE_MAP_CRS} = require('../actions/map');

const assign = require('object-assign');
function crsselector(state = {projections: []}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return assign({}, state, {
            value: action.value
        });
    case CHANGE_MAP_CRS: {
        let Crsprojections = state.projections;
        const newProjections = Crsprojections.map(
            proj => {
                if (proj.value === action.crs) {
                    proj.active = true;
                }else {
                    proj.active = false;
                }
                return {
                    value: action.crs,
                    active: proj.active
                };
            }
            );
        return assign({}, state, {
            selected: action.crs,
            projections: newProjections
        });
    }
    default:
        return state;
    }
}

module.exports = crsselector;
