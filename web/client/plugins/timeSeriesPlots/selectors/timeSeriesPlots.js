import { createControlEnabledSelector } from '../../../selectors/controls';
import { CONTROL_NAME } from '../constants';

// export const timeSeriesPlotsPluginEnabledSelector = state => state?.controls?.timeSeriesPlots?.enabled;
export const enabledSelector = createControlEnabledSelector("timeSeriesPlots");