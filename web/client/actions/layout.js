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
} from '../utils/LayoutUtils';
import {
    activePluginsSelector,
    panelSizesSelector,
    layoutStructureSelector
} from '../selectors/layout';

export const updateLayoutType = setControlProperty.bind(null, 'layout', 'type');

export const resizeLayoutPanel = (name, data) => {
    return (dispatch, getState) => {
        const state = getState();
        const panelSizes = panelSizesSelector(state);
        const layoutStructure = layoutStructureSelector(state);
        const newPanelSizes = updatePanelSizes({ panelSizes, layoutStructure, name, data });
        dispatch(setControlProperty('layout', 'panelSizes', newPanelSizes));
    };
};

export const setActivePlugin = (name, enable) => {
    return (dispatch, getState) => {
        const state = getState();
        const activePlugins = activePluginsSelector(state);
        const layoutStructure =  layoutStructureSelector(state);
        const newActivePlugins = updateActivePlugins({ activePlugins, layoutStructure, name, enable });
        dispatch(setControlProperty('layout', 'activePlugins', newActivePlugins));
    };
};

export const updateLayoutStructure = setControlProperty.bind(null, 'layout', 'structure');
