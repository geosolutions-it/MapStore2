/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setControlProperty } from './controls';
import get from 'lodash/get';

export const updateLayoutType = setControlProperty.bind(null, 'layout', 'type');

export const resizeLayoutPanel = (data, menuId) => {
    return (dispatch, getState) => {
        const panelSizes = get(getState(), 'controls.layout.panelSizes') || {};
        dispatch(setControlProperty('layout', 'panelSizes', {
            ...panelSizes,
            [menuId]: { ...data }
        }));
    };
};

export const setActivePlugin = (name, enable) => {
    return (dispatch, getState) => {
        const state = getState();
        const activePlugins = get(state, 'controls.layout.activePlugins') || [];
        const layoutStructure = get(state, 'controls.layout.structure') || [];
        const layoutSectionKey = Object.keys(layoutStructure)
            .find((key) =>
                layoutStructure[key].find((pluginName) => pluginName === name)
            );
        const layoutSectionItemsName = layoutStructure[layoutSectionKey] || [];

        const isActive = enable === undefined
            ? !!activePlugins.find((activePlugin) => activePlugin === name)
            : !enable;

        const filteredActivePlugins = activePlugins
            .filter(
                (activePlugin) => !layoutSectionItemsName.find((pluginName) => pluginName === activePlugin)
            );

        const newActivePlugins = [
            ...(isActive
                ? []
                : [name]),
            ...filteredActivePlugins
        ];
        dispatch(setControlProperty('layout', 'activePlugins', newActivePlugins));
    };
};

export const updateLayoutStructure = setControlProperty.bind(null, 'layout', 'structure');
