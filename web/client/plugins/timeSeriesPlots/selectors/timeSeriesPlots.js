import { createControlEnabledSelector } from '../../../selectors/controls';

// export const timeSeriesPlotsPluginEnabledSelector = state => state?.controls?.timeSeriesPlots?.enabled;
export const enabledSelector = createControlEnabledSelector('timeSeriesPlots');