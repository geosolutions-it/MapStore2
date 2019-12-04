/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get} from "lodash";


/**
 * Selects the open/closed state of the mapEditor
 * @memberof selectors
 * @param {object} state application state
 */
export const openSelector = state => get(state, "mapEditor.open");
/**
 * Selects the owner that requested the mapEditor
 * @memberof selectors
 * @param {object} state application state
 */
export const ownerSelector = state => get(state, "mapEditor.owner");

