import { CONTROL_NAME, getTSSelectionsStyle } from '../constants';
import { createControlEnabledSelector } from '../../../selectors/controls';
import { makeFeatureFromGeometry } from '../utils';
import { pickBy } from 'lodash';


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

/** gets the current aggregation function
 * @param {object} state
 * @returns {string} the current aggregation operation on for the WPS processing
 */
export function aggregateFunctionSelector(state) { return state?.timeSeriesPlots?.pluginCfg?.aggregateFunction; }

// **********************************************
// LAYERS
// **********************************************

 /**
 * gets the base time-bound layer params from config 
 * @param {object} state
 * @returns {string} the config of the layers to be analysed
 */
export function timeSeriesLayersSelector(state) { return state?.timeSeriesPlots?.pluginCfg?.timeSeriesLayers || []; }
export function getTimeSeriesLayerByName(state, name) { 
  const timeSeriesLayers = state?.timeSeriesPlots?.pluginCfg?.timeSeriesLayers || [];
  const selectedTimeSeriesLayer = timeSeriesLayers.filter(layer => layer.layerName === name)[0];
  return selectedTimeSeriesLayer ?? {};
}

export function timeSeriesCatalogServiceSelector(state) {
    const services = state.catalog.services || {};
    const x = Object.keys(pickBy(services, (value, key) => {
      return key.startsWith((state?.timeSeriesPlots?.pluginCfg?.timeSeriesCatalogService?.title || 'Time Series Layers Service'));
    }))[0];
    return x;
}

export function timeSeriesCatalogServiceTitleSelector(state) { return state?.timeSeriesPlots?.pluginCfg?.timeSeriesCatalogService?.title || ''}


// **********************************************
// SELECTED_FEATURES
// **********************************************

 /**
 * sets the index of the current selected selection
 * @param {object} state
 * @returns {int} the index of the current selection
 */
export function timeSeriesFeaturesSelectionsSelector(state) { return state?.timeSeriesPlots?.timePlotsData?.map(({selectionGeometry, traceColor}) => makeFeatureFromGeometry(selectionGeometry, traceColor)) ?? []}

// **********************************************
// CHART_DATA
// **********************************************

/**
 * gets the base data to feed Plotly to design
 * the time-bound data charts
 */
export function timePlotsDataSelector(state) { return state.timeSeriesPlots?.timePlotsData ?? [] }
export function currentTraceColorsSelector(state) { return state.timeSeriesPlots.timePlotsData && state.timeSeriesPlots.timePlotsData.map(item => item.traceColor) || [] }
export function timePlotDataSelector(state, selectionId) { return state.timeSeriesPlots.timePlotsData && state.timeSeriesPlots.timePlotsData.filter(timePlotData => timePlotData.selectionId === selectionId) || [] 
}