/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setControlProperty } from './controls';
import {
    updateActivePlugins,
    updatePanelSizes
} from '../utils/FlexibleLayoutUtils';
import {
    activePluginsSelector,
    panelSizesSelector,
    flexibleLayoutStructureSelector
} from '../selectors/flexiblelayout';

export const updateFlexibleLayoutType = setControlProperty.bind(null, 'flexibleLayout', 'type');

export const resizeFlexibleLayoutPanel = (name, data) => {
    return (dispatch, getState) => {
        const state = getState();
        const panelSizes = panelSizesSelector(state);
        const layoutStructure = flexibleLayoutStructureSelector(state);
        const newPanelSizes = updatePanelSizes({ panelSizes, layoutStructure, name, data });
        dispatch(setControlProperty('flexibleLayout', 'panelSizes', newPanelSizes));
    };
};

export const setActivePlugin = (name, enable) => {
    return (dispatch, getState) => {
        const state = getState();
        const activePlugins = activePluginsSelector(state);
        const layoutStructure =  flexibleLayoutStructureSelector(state);
        const newActivePlugins = updateActivePlugins({ activePlugins, layoutStructure, name, enable });
        dispatch(setControlProperty('flexibleLayout', 'activePlugins', newActivePlugins));
    };
};

export const updateFlexibleLayoutStructure = setControlProperty.bind(null, 'flexibleLayout', 'structure');
