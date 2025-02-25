import { UPDATE_LAYER_DIMENSION_DATA, SET_CURRENT_TIME, SET_OFFSET_TIME, MOVE_TIME } from '../actions/dimension';
import { REMOVE_NODE } from '../actions/layers';
import { RESET_CONTROLS } from '../actions/controls';
import { set } from '../utils/ImmutableUtils';
import moment from 'moment';
import { mapValues, pickBy } from 'lodash';

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
 */
export default (state = {}, action) => {
    switch (action.type) {
    case UPDATE_LAYER_DIMENSION_DATA: {
        return set(`data[${action.dimension}][${action.layerId}]`, action.data, state);
    }
    case SET_CURRENT_TIME: {
        return set(`currentTime`, action.time, state);
    }
    case SET_OFFSET_TIME: {
        return set('offsetTime', action.offsetTime, state);
    }
    case MOVE_TIME: { // same as SET_CURRENT_TIME, but if offsetTime is defined, it moves it together with time
        if (state.offsetTime && state.currentTime) {
            const currentRange = moment(state.offsetTime).diff(state.currentTime);
            const nextOffsetTime = moment(action.time).add(currentRange);
            return set(`currentTime`, action.time, set('offsetTime', nextOffsetTime.toISOString(), state));
        }
        return set(`currentTime`, action.time, state);
    }
    case REMOVE_NODE: {
        const newData = mapValues(state.data, (o) => pickBy(o, (values, keys) => keys !== action.node));
        return set(`data`, newData, state);
    }
    case RESET_CONTROLS: {
        return set('data', undefined, set('currentTime', undefined, set('offsetTime', undefined, state)));
    }
    default:
        return state;
    }
};
