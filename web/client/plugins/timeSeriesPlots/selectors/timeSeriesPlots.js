import { CONTROL_NAME } from '../constants';
import { createControlEnabledSelector } from '../../../selectors/controls';


// **********************************************
// PLUGIN
// **********************************************

/** gets from the application state if the plugin is enabled (shown)/disabled (hidden) */
export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);


// **********************************************
// TOOLS
// **********************************************

/**
 * gets the current active selection tool for map (id)
 * @param {object} state
 * @returns {string} the selection type (one of constants.SELECTION_TYPES)
 */
export function currentSelectionToolSelector(state) { return state?.timeSeriesPlots?.selectionType; }


// **********************************************
// LAYERS
// **********************************************

 /**
 * gets the current selected Time bound data layerID  
 * @param {object} state
 * @returns {string} the names of the layers to be analysed
 */
 export function timeSeriesLayersNameSelector(state) { return state?.timeSeriesPlots?.pluginCfg?.timeSeriesLayers || []; }