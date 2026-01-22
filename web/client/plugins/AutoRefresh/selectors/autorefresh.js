import get from "lodash/get";
import { AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC, CONTROL_NAME } from "../constants";
import { createControlEnabledSelector } from "../../../selectors/controls";

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);

export const autorefreshLayerIdsSelector = (state) => get(state, `${CONTROL_NAME}.layerIds`, []);
export const autorefreshEnabledSelector = (state) => get(state, `${CONTROL_NAME}.enabled`, false);
export const autorefreshIntervalSelector = (state) => get(state, `${CONTROL_NAME}.interval`, AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC);
