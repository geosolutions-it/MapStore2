import get from "lodash/get";
import { CONTROL_NAME } from "../constants";
import { createControlEnabledSelector } from "../../../selectors/controls";

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);

export const autorefreshEnabledSelector = (state) => get(state, `${CONTROL_NAME}.enabled`, false);

export const autorefreshLayersSelector = (state) => get(state, `${CONTROL_NAME}.activeLayers`, {});

export const autorefreshTicksSelector = (state) => get(state, `${CONTROL_NAME}.ticks`, {});

export const autorefreshAvailableLayersSelector = (state) => get(state, `${CONTROL_NAME}.availableLayers`, {});

