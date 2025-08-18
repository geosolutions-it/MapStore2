/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from "lodash/get";
import { createControlEnabledSelector } from "../../../selectors/controls";
import { CONTROL_NAME } from "../constants";

export const enabledSelector = createControlEnabledSelector(CONTROL_NAME);

// Selectors for itinerary search state
export const searchLoadingSelector = (state) => get(state, 'itinerary.loading', []);
export const searchResultsSelector = (state) => get(state, 'itinerary.results', []);
export const searchErrorSelector = (state) => get(state, 'itinerary.error', null);
export const locationsSelector = (state) => get(state, 'itinerary.locations', []);
export const itineraryDataSelector = (state) => get(state, 'itinerary.data', []);
export const itineraryLoadingSelector = (state) => get(state, 'itinerary.itineraryLoading', false);
