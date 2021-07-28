import { REMOVE_NODE } from '../actions/layers';
import { RESET_CONTROLS } from '../actions/controls';
import { RANGE_CHANGED, RANGE_DATA_LOADED, LOADING, SELECT_LAYER, INIT_SELECT_LAYER, SET_COLLAPSED, SET_MAP_SYNC, INIT_TIMELINE } from '../actions/timeline';
import { set } from '../utils/ImmutableUtils';
import { assign, pickBy, has } from 'lodash';

/**
 * Provides state for the timeline. Example:
 * ```
 * {
 *     settings: {
 *         autoSelect: true // true by defaults, if set the first layer available will be selected on startup
 *         showHiddenLayers: true // false by default. If set to false, the guide layers will be in sync with time layer's visibility in TOC and automatically switches to the next available guide layer (if snap to guide layer is enabled)
 *     },
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
export default (state = {
    settings: {
        autoSelect: true, // selects the first layer available as guide layer. This is a configuration only setting for now
        collapsed: false
    }
}, action) => {
    switch (action.type) {
    case SET_COLLAPSED: {
        return set(`settings.collapsed`, action.collapsed, state);
    }
    case SET_MAP_SYNC: {
        return set(`settings.mapSync`, action.mapSync, state);
    }
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
        return action.layerId ? set(`loading[${action.layerId}]`, action.loading, state) : set(`loading.timeline`, action.loading, state);
    }
    case SELECT_LAYER: case INIT_SELECT_LAYER: {
        return set('selectedLayer', action.layerId, state);
    }
    case REMOVE_NODE: {
        let newState = state;
        return assign({}, state, {
            rangeData: has(newState.rangeData, action.node) ? pickBy(newState.rangeData, (values, key) => key !== action.node) : newState.rangeData,
            loading: has(newState.rangeData, action.node) ? pickBy(newState.loading, (values, key) => key !== action.node) : newState.loading,
            selectedLayer: state.selectedLayer === action.node ? undefined : state.selectedLayer
        });
    }
    case RESET_CONTROLS: {
        return assign({}, state, { range: undefined, rangeData: undefined, selectedLayer: undefined, loading: undefined, MouseEvent: undefined});
    }
    case INIT_TIMELINE: {
        return set(`settings.showHiddenLayers`, action.showHiddenLayers, state);
    }
    default:
        return state;
    }
};
