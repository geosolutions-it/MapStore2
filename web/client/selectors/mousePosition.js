/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from "lodash";

/**
 * Selects the mouseOut state of the mousePosition
 * @memberof selectors
 * @param {object} state application state
 */
export const mouseOutSelector = state => get(state, "mousePosition.mouseOut");
