import { REMOVE_NODE } from '../actions/layers';
import { RESET_CONTROLS } from '../actions/controls';
import {
    RANGE_CHANGED,
    RANGE_DATA_LOADED,
    LOADING, SELECT_LAYER,
    INIT_SELECT_LAYER,
    SET_COLLAPSED,
    SET_MAP_SYNC,
    INIT_TIMELINE,
    SET_SNAP_TYPE,
    SET_END_VALUES_SUPPORT,
    SET_SNAP_RADIO_BUTTON_ENABLED,
    SET_TIME_LAYERS,
    UPDATE_TIME_LAYERS_SETTINGS
} from '../actions/timeline';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { SET_INTERVAL_DATA } from '../actions/playback';
import { set } from '../utils/ImmutableUtils';
import { assign, pickBy, has } from 'lodash';

/**
 * Provides state for the timeline. Example:
 * ```
 * {
 *     settings: {
 *         autoSelect: true // true by defaults, if set the first layer available will be selected on startup
 *         showHiddenLayers: true // false by default. If set to false, the guide layers will be in sync with time layer's visibility in TOC and automatically switches to the next available guide layer (if snap to guide layer is enabled)
 *         snapType: "start" // start by default. If set to "end" the timeline cursor will snap to the end of the interval when changed
 *         endValuesSupport: undefined // undefined by default. If set to true the snap to (start/end) radio button will appear, both snapping are supported
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
        collapsed: false,
        snapType: "start", // in case of interval values snapping is defaulted to the start of the interval
        snapRadioButtonEnabled: false // initial state of snapping radio button is disabled, will be enabled according to layer time data
    }
}, action) => {
    switch (action.type) {
    case SET_COLLAPSED: {
        return set(`settings.collapsed`, action.collapsed, state);
    }
    case SET_MAP_SYNC: {
        return set(`settings.mapSync`, action.mapSync, state);
    }
    case SET_SNAP_TYPE: {
        return set(`settings.snapType`, action.snapType, state);
    }
    case SET_END_VALUES_SUPPORT: {
        return set(`settings.endValuesSupport`, action.endValuesSupport, state);
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
    case SELECT_LAYER: {
        let newState = state;
        newState = set(`selectedLayer`, action.layerId, newState);
        newState = set(`settings`, {
            ...newState.settings,
            snapType: "start",
            snapRadioButtonEnabled: false
        }, newState);
        return newState;
    }
    case SET_SNAP_RADIO_BUTTON_ENABLED:
    case SET_INTERVAL_DATA: {
        const snapRadioButtonEnabled = action.timeIntervalData ?? action.snapRadioButtonEnabled;
        return set('settings.snapRadioButtonEnabled', snapRadioButtonEnabled, state);
    }
    case INIT_SELECT_LAYER: {
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
        return assign({}, state, { range: undefined, rangeData: undefined, selectedLayer: undefined, loading: undefined, MouseEvent: undefined, layers: undefined});
    }
    case INIT_TIMELINE: {
        const endValuesSupport = state?.settings?.endValuesSupport;
        const snapRadioButtonEnabled = state?.settings?.snapRadioButtonEnabled;
        const cfg = action?.config;
        return set(`settings`, {
            ...state.settings,
            showHiddenLayers: cfg.showHiddenLayers,
            expandLimit: cfg.expandLimit,
            snapType: cfg.snapType,
            endValuesSupport: endValuesSupport ?? cfg.endValuesSupport,
            snapRadioButtonEnabled: snapRadioButtonEnabled ?? cfg.snapRadioButtonEnabled,
            initialMode: cfg.initialMode,
            initialSnap: cfg.initialSnap
        }, state);
    }
    case MAP_CONFIG_LOADED: {
        const newState = {
            ...state,
            settings: {
                ...state.settings,
                endValuesSupport: action?.config?.timelineData?.endValuesSupport,
                snapRadioButtonEnabled: action?.config?.timelineData?.snapRadioButtonEnabled
            }
        };
        return newState;
    }
    case SET_TIME_LAYERS: {
        return set('layers', action.layers, state);
    }
    case UPDATE_TIME_LAYERS_SETTINGS: {
        return set('layers',
            (state.layers || []).map(l =>
                Object.keys(l)?.find(id => id === action.id)
                    ? set(`${action.id}`, { hideInTimeline: !action.checked }, l) : l),
            state);
    }
    default:
        return state;
    }
};
