/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNil from 'lodash/isNil';
import { UPDATE_MAP_LAYOUT, updateMapLayout, updateDockPanelsList } from '../../../actions/maplayout';
import { SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, TOGGLE_CONTROL, RESET_CONTROLS } from '../../../actions/controls';
import { DEFAULT_PANEL_WIDTH, getBoundingSidebarRect } from '../../../utils/LayoutUtils';
import { CONTROL_NAME } from '../constants';
import { enabledSelector, isFloatingSelector } from '../selectors/dynamiclegend';
import { SET_CONFIGURATION } from '../actions/dynamiclegend';
const OFFSET = DEFAULT_PANEL_WIDTH;

/**
 * Handles dynamic legend map layout updates
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `UPDATE_MAP_LAYOUT`
 * @return {external:Observable}
 */
export const dynamicLegendMapLayoutEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => {
            return !isFloatingSelector(store.getState()) && enabledSelector(store.getState()) && isNil(source);
        })
        .map(({layout}) => {
            const boundingSidebarRect = getBoundingSidebarRect(layout);
            const newLayout = {
                ...layout,
                right: OFFSET + boundingSidebarRect.right,
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: OFFSET + boundingSidebarRect.right
                },
                boundingSidebarRect,
                rightPanel: true
            };
            const action = updateMapLayout(newLayout);
            return { ...action, source: CONTROL_NAME };
        });

export const dynamicLegendDockPanelEpic = (action$, store) => action$
    .ofType(SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES, TOGGLE_CONTROL, RESET_CONTROLS, SET_CONFIGURATION)
    .filter(action => [SET_CONFIGURATION, RESET_CONTROLS].includes(action.type)
        || (action.control === CONTROL_NAME && (action.type === SET_CONTROL_PROPERTIES
            ? Object.hasOwn(action.properties, 'enabled')
            : !action.property || action.property === 'enabled')))
    .map(() => updateDockPanelsList(CONTROL_NAME,
        enabledSelector(store.getState()) && !isFloatingSelector(store.getState()) ? 'add' : 'remove', 'right'));

export default {
    dynamicLegendMapLayoutEpic,
    dynamicLegendDockPanelEpic
};
