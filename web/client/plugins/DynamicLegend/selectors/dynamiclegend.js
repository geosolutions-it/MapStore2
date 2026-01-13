/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createControlEnabledSelector } from "../../../selectors/controls";
import { CONTROL_NAME } from "../constants";

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);

export const isFloatingSelector = state => !!state?.dynamiclegend?.config?.isFloating;

