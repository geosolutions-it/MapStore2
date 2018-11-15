const { RANGE_CHANGED } = require('../actions/timeline');
const { RANGE_DATA_LOADED, LOADING, SELECT_LAYER, SELECT_OFFSET, MOUSE_EVENT } = require('../actions/timeline');
const { set } = require('../utils/ImmutableUtils');


/**
 * Provides state for the timeline. Example:
 * ```
 * {
 *     range: {
 *         start: // start date of the current range
 *         end: // end date of the current range
 *     }
 *     loading: {
 *          layerID_1: false // map of loading flags for layer time data
 *     },
 *     rangeData: {
 *          // one entry for each layer ID
 *          layerID_1: {
 *              range: {
 *                  start: "2016-04-13T14:48:32.048Z",
 *                  end: "2017-08-01T16:57:10.726Z"
 *              },
 *              histogram: {
 *                  values: [0, 10, 2, 6, 0, 20] // values of the histogram
 *                  domain: "2016-09-01T00:00:00.000Z/2017-04-11T00:00:00.000Z/PT570H" // format: START/END/RESOLUTION
 *              },
 *              domain: {
 *                   values: [ // domain values in ISO FORMAT
 *              }
 *                      '2016-12-17T00:00:00.000Z',
 *                      '2016-12-18T00:00:00.000Z',
 *                      '2016-12-20T00:00:00.000Z',
 *                      '2017-01-05T00:00:00.000Z']
 *          }
 *     }
 * }
 * ```
 * @memberof reducers
 * @name timeline
 * @param {object} state the previous state
 * @param {action} action

 */
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
        case LOADING: {
            return set(`loading[${action.layerId}]`, action.loading, state);
        }
        case SELECT_LAYER: {
            return set('selectedLayer', action.layerId, state);
        }
        case SELECT_OFFSET: {
            return set('offsetTime', action.offset, state);
        }
        case MOUSE_EVENT: {
            return set('mouseEvent', action.eventData, state);
        }
        default:
            return state;
    }
    return state;
};
