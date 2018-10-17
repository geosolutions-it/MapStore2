const { UPDATE_LAYER_DIMENSION_DATA, SET_CURRENT_TIME } = require('../actions/dimension');
const { set } = require('../utils/ImmutableUtils');


/**
 * Provide state for current time and dimension info.
 * It is updated with dimension information on load
 * ```
 * {
 *    data: {
 *        dim_name: {} // one entry for each dimension
 *        time: {
 *              'landsat8:B3__8': {
 *                source: { // describes the source of dimension
 *                  type: 'multidim-extension',
 *                  url: 'http://domain.com:80/geoserver/wms'
 *                },
 *                name: 'time',
 *                domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
 *              }
 *           }
 *        }
 *   }
 *  }
 * ```
 * @name dimension
 * @memberof reducers
 * @param {object} state previous state
 * @param {action} action
 * @example
 */
module.exports = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_LAYER_DIMENSION_DATA: {
            return set(`data[${action.dimension}][${action.layerId}]`, action.data, state);
        }
        case SET_CURRENT_TIME: {
            return set(`currentTime`, action.time, state);
        }
        // case REMOVE_NODE:{
        //     return state.dimension.data.map((element) => element[action.layerId] && delete element[action.layerId]);

        // }
        default:
            return state;
    }
    return state;
};
