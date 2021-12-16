import { createControlEnabledSelector } from '../../../selectors/controls';


// **********************************************
// PLUGIN
// **********************************************

/** gets from the application state if the plugin is enabled (shown)/disabled (hidden) */
export const enabledSelector = createControlEnabledSelector("timeSeriesPlots");


// **********************************************
// TOOLS
// **********************************************

/**
 * gets the current active selection tool for map (id)
 * @param {object} state
 * @returns {string} the selection type (one of constants.SELECTION_TYPES)
 */
 export function currentSelectionToolSelector(state) { return state?.timeSeriesPlots?.selectionType; }