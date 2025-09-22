/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

import { getDashboardWidgets, getDashboardWidgetsLayout } from './widgets';
import { originalDataSelector } from './dashboard';
import { compareDashboardDataChanges } from '../utils/GeostoreUtils';

export const dashboardHasPendingChangesSelector = createSelector(originalDataSelector, getDashboardWidgets, getDashboardWidgetsLayout, (originalData, widgets, layouts) => {
    return compareDashboardDataChanges({ widgets, layouts }, originalData);
});
