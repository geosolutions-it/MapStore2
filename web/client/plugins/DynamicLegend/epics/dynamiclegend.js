/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNil from 'lodash/isNil';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../../../actions/maplayout';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { CONTROL_NAME } from '../constants';
import { enabledSelector, isFloatingSelector } from '../selectors/dynamiclegend';
const OFFSET = DEFAULT_PANEL_WIDTH;

/**
 * Handles dynamic legend map layout updates
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `UPDATE_MAP_LAYOUT`
 * @return {external:Observable}
 */
export const dynamicLegendMapLayoutEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => !isFloatingSelector(store.getState()) && enabledSelector(store.getState()) && isNil(source))
        .map(({layout}) => {
            const action = updateMapLayout({
                ...layout,
                right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0),
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0)
                },
                rightPanel: true
            });
            return { ...action, source: CONTROL_NAME };
        });

export default {
    dynamicLegendMapLayoutEpic
};
